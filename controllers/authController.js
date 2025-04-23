const { verify, sign } = require("jsonwebtoken");
const { compare, hash } = require("bcrypt");
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

/**
 * @swagger
 * /auth/token/access:
 *   post:
 *     summary: Génère un token d'accès pour un utilisateur
 *     tags: [Auth - Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [user, mods, admin]
 *     responses:
 *       200:
 *         description: Access token généré
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
const generateAccessToken = (userId, role) => {
    return sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: Génère un token de rafraîchissement JWT
 *     tags: [Auth - Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               tokenId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh token généré
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
const generateRefreshToken = (userId, tokenId) => {
    return sign({ id: userId, jti: tokenId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
};

/**
 * @swagger
 * /auth/discord/callback:
 *   get:
 *     summary: Callback OAuth2 pour connexion via Discord
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirection vers le front avec session initiée
 *       400:
 *         description: Code manquant ou erreur OAuth
 */
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

        // 2. Récupération des infos utilisateur via Discord API
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
                role: 'admin' // À sécuriser en prod
            });
        } else {
            user.avatar = discordUser.avatar;
            await user.save();
        }

        // 4. Génération des tokens JWT
        const jwtAccessToken = generateAccessToken(user.id, user.role);
        const tokenId = uuidv4();
        const jwtRefreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({ token: tokenId, UserId: user.id, expiresAt });

        // 5. Cookie HTTPOnly avec refresh token
        res.cookie('refreshToken', jwtRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 6. Redirection vers l'app front
        res.redirect(process.env.FRONT_URL || 'http://localhost:5173/');

    } catch (err) {
        console.error('Discord OAuth Error:', err.response?.data || err.message);
        res.status(400).json({ message: 'Discord OAuth error', details: err.response?.data || err.message });
    }
};

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Rafraîchit un accessToken à partir d'un refreshToken valide
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nouveau accessToken retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Token invalide ou expiré
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        const storedToken = await RefreshToken.findOne({ where: { token: tokenId } });
        if (!storedToken) return res.status(401).json({ message: 'Invalid refresh token' });

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const newAccessToken = generateAccessToken(decoded.id, decoded.role);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnecte l'utilisateur actuel (révoque le refreshToken utilisé)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       400:
 *         description: Token manquant
 *       401:
 *         description: Token invalide ou expiré
 */
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

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Déconnecte l'utilisateur de tous les appareils
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sessions révoquées
 *       400:
 *         description: Paramètre manquant
 */
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupère l'utilisateur connecté via le cookie refreshToken
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retourne les infos de l'utilisateur + un nouveau accessToken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       401:
 *         description: Token invalide ou expiré
 */
exports.getMe = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const storedToken = await RefreshToken.findOne({ where: { token: decoded.jti } });
        if (!storedToken) return res.status(401).json({ message: 'Invalid refresh token' });

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const newAccessToken = generateAccessToken(user.id, user.role);

        res.json({
            accessToken: newAccessToken,
            user: {
                id: user.discordId,
                avatar: user.avatar,
                username: user.username
            }
        });
    } catch (err) {
        console.error('Auth Me Error:', err);
        res.status(401).json({ message: 'Invalid session' });
    }
};
