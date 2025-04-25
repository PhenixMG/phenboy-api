const express = require('express');
const router = express.Router();
const { getDiscordGuilds, getGuildChannels} = require('../controllers/discordController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const rateLimiter = require('../middlewares/rateLimiter');

// Guilds (serveurs) de l'utilisateur
router.get('/guilds', isAuthenticated, rateLimiter, getDiscordGuilds);
router.get('/guilds/:guildId/channels', isAuthenticated, rateLimiter, getGuildChannels)
module.exports = router;
