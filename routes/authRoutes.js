const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /auth/refresh-token
 * @desc Rafraîchit un accessToken via le refreshToken
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route POST /auth/logout
 * @desc Déconnecte la session actuelle (supprime le refreshToken)
 */
router.post('/logout', authController.logout);

/**
 * @route POST /auth/logout-all
 * @desc Déconnecte toutes les sessions pour un utilisateur
 */
router.post('/logout-all', authController.logoutAll);

/**
 * @route GET /auth/discord/callback
 * @desc Callback Discord OAuth2 (code => user & token)
 */
router.get('/discord/callback', authController.discordCallback);

/**
 * @route GET /auth/me
 * @desc Renvoie les infos de l'utilisateur via le refreshToken (cookie)
 */
router.get('/me', authController.getMe);

module.exports = router;
