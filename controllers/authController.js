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

// Ajouté pour Discord OAuth
exports.discordCallback = async (req, res, next) => {
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

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const discordUser = userResponse.data;

        let user = await User.findOne({ where: { discordId: discordUser.id } });
        if (!user) {
            user = await User.create({
                username: discordUser.username,
                discordId: discordUser.id,
                role: 'admin'
            });
        }

        const jwtAccessToken = generateAccessToken(user.id, user.role);
        const tokenId = uuidv4();
        const jwtRefreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({ token: tokenId, UserId: user.id, expiresAt });

        res.json({ accessToken: jwtAccessToken, refreshToken: jwtRefreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur Discord login' });
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