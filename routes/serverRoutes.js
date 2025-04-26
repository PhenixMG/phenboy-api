const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const rateLimiter = require('../middlewares/rateLimiter');
const {getDiscordGuilds, getSpecificGuild, getGuildChannels} = require("../controllers/serverController");
const {getUserConfiguredServers, saveGuildConfiguration, getDashboardData} = require("../controllers/userController");

// Guilds (serveurs) de l'utilisateur discord
router.get('/', isAuthenticated, rateLimiter, getDiscordGuilds);
router.get('/guilds/:guildId', isAuthenticated, rateLimiter, getSpecificGuild)
router.get('/guilds/:guildId/channels', isAuthenticated, rateLimiter, getGuildChannels)

// Gestion des serveurs en Base
router.get('/servers', isAuthenticated, getUserConfiguredServers);
router.post('/:serverId/config', isAuthenticated, saveGuildConfiguration);
router.get('/:serverId/dashboard', isAuthenticated, getDashboardData);

module.exports = router;
