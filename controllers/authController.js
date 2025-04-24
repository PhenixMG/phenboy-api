const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/User');
const { RefreshToken } = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../services/tokenService');

exports.discordCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Code not provided' });

    try {
        // 1. Récupération du token via Discord OAuth2
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
        const expiresIn = tokenResponse.data.expires_in;

        // 2. Infos utilisateur Discord
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const discordUser = userResponse.data;

        // 3. Création ou mise à jour de l'utilisateur local
        let user = await User.findOne({ where: { discordId: discordUser.id } });

        if (!user) {
            user = await User.create({
                username: discordUser.username,
                discordId: discordUser.id,
                avatar: discordUser.avatar,
                role: 'admin' // À ajuster
            });
        } else {
            user.avatar = discordUser.avatar;
        }

        // 4. Stockage access token + expiration
        user.discordAccessToken = accessToken;
        user.discordTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
        await user.save();

        // 5. JWT
        const jwtAccessToken = generateAccessToken(user.id, user.role);
        const tokenId = uuidv4();
        const jwtRefreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
            token: tokenId,
            UserId: user.id,
            expiresAt
        });

        // 6. Cookie HTTPOnly
        res.cookie('refreshToken', jwtRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 7. Redirection
        res.redirect(process.env.FRONT_URL || 'http://localhost:5173/');
    } catch (err) {
        console.error('Discord OAuth Error:', err.response?.data || err.message);
        res.status(400).json({
            message: 'Discord OAuth error',
            details: err.response?.data || err.message
        });
    }
};

exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    try {
        const payload = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        await RefreshToken.destroy({ where: { token: payload.jti } });

        const user = await User.findByPk(payload.id);
        if (user) {
            user.discordAccessToken = null;
            user.discordTokenExpiresAt = null;
            await user.save();
        }
    } catch (_) {
        // ignore invalid token
    }

    res.clearCookie('refreshToken');
    res.sendStatus(204);
};

exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const payload = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const dbToken = await RefreshToken.findOne({ where: { token: payload.jti } });

        if (!dbToken || dbToken.expiresAt < new Date()) {
            return res.sendStatus(403);
        }

        const user = await User.findByPk(payload.id);
        const newAccessToken = generateAccessToken(user.id, user.role);
        res.json({ accessToken: newAccessToken });
    } catch (_) {
        res.sendStatus(403);
    }
};
