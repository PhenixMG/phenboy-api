const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const rateLimiter = require('../middlewares/rateLimiter');
const {getDiscordGuilds, getSpecificGuild, getSaveGuildChannels, getGuildChannels} = require("../controllers/serverController");
const {getUserConfiguredServers, saveGuildConfiguration, getDashboardData} = require("../controllers/userController");

// Guilds (serveurs) de l'utilisateur discord
router.get('/discord/guilds', isAuthenticated, rateLimiter, getDiscordGuilds);
router.get('/guilds/:guildId', isAuthenticated, rateLimiter, getSpecificGuild)

// Gestion des serveurs en Base
router.get('/', isAuthenticated, getUserConfiguredServers);
router.post('/:serverId/config', isAuthenticated, saveGuildConfiguration);
router.get('/:serverId/dashboard', isAuthenticated, getDashboardData);
router.get('/:guildId/channels', isAuthenticated, rateLimiter, getSaveGuildChannels)
router.get('/:guildId/discord/channels', isAuthenticated, rateLimiter, getGuildChannels)

module.exports = router;
