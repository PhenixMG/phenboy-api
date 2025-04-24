const express = require('express');
const router = express.Router();
const { getDiscordProfile, getDiscordGuilds } = require('../controllers/discordController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const rateLimiter = require('../middlewares/rateLimiter');

// Profil Discord de l'utilisateur
router.get('/me', isAuthenticated, rateLimiter, getDiscordProfile);

// Guilds (serveurs) de l'utilisateur
router.get('/guilds', isAuthenticated, rateLimiter, getDiscordGuilds);

module.exports = router;
