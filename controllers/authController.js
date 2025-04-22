const {verify, sign} = require("jsonwebtoken");
const {compare, hash} = require("bcrypt");
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const RefreshToken  = require('../models/RefreshToken');

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

const generateAccessToken = (userId, role) => {
    return sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

const generateRefreshToken = (userId, tokenId) => {
    return sign({ id: userId, jti: tokenId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
};

exports.discordCallback = async (req, res, next) => {
    console.log('Envoyé comme redirect_uri:', process.env.DISCORD_REDIRECT_URI);
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Code not provided' });

    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.DISCORD_CLIENT_ID);
        params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. Récupérer les infos de l'utilisateur Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const discordUser = userResponse.data;

        // 3. Vérifier/Créer l'utilisateur local
        let user = await User.findOne({ where: { discordId: discordUser.id } });
        if (!user) {
            user = await User.create({
                username: discordUser.username,
                discordId: discordUser.id,
                avatar: discordUser.avatar, // <-- très important
                role: 'admin'
            });
        } else {
            // Optionnel: mettre à jour l'avatar si changé sur Discord
            user.avatar = discordUser.avatar;
            await user.save();
        }

        // 4. Générer tes propres JWT
        const jwtAccessToken = generateAccessToken(user.id, user.role);
        const tokenId = uuidv4();
        const jwtRefreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({ token: tokenId, UserId: user.id, expiresAt });

        // 5. Déposer un cookie HTTP Only avec le refreshToken
        res.cookie('refreshToken', jwtRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // sécurise uniquement en prod (https)
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        // 6. Rediriger tranquillement vers ton site Front
        res.redirect(process.env.FRONT_URL || 'http://localhost:5173/');

    } catch (err) {
        console.error('Discord OAuth Error:', err.response?.data || err.message);
        res.status(400).json({ message: 'Discord OAuth error', details: err.response?.data || err.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        const storedToken = await RefreshToken.findOne({ where: { token: tokenId } });
        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const newAccessToken = generateAccessToken(decoded.id);

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        await RefreshToken.destroy({ where: { token: tokenId } });

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

// Nouveau : logout ALL sessions
exports.logoutAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        await RefreshToken.destroy({ where: { UserId: userId } });

        res.json({ message: 'Logged out from all devices' });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const storedToken = await RefreshToken.findOne({ where: { token: decoded.jti } });
        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Regénérer un nouvel accessToken
        const newAccessToken = generateAccessToken(user.id, user.role);

        res.json({
            accessToken: newAccessToken,
            user: {
                id: user.discordId,
                avatar: user.avatar, // <-- ici aussi
                username: user.username
            }
        });
    } catch (err) {
        console.error('Auth Me Error:', err);
        res.status(401).json({ message: 'Invalid session' });
    }
};