require('dotenv').config();
const discordService = require('../services/discordService');
const {get} = require("axios");
const User = require('../models/User');
const Server = require('../models/Server');
const {getGuildChannels} = require("../services/discordService");

exports.getDiscordProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        const { discordId, username, avatar } = user;
        res.json({ discordId, username, avatar });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
    }
};

exports.getDiscordGuilds = async (req, res) => {
    try {
        // 1. Récupère les guilds de l'utilisateur (via OAuth)
        const userGuilds = await discordService.getUserGuilds(req.user.id);

        // 2. Récupère les guilds du bot
        const botGuildResponse = await get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });

        const botGuildIds = botGuildResponse.data.map(g => g.id);

        // 3. Récupère les serveurs déjà configurés en base
        const configuredServers = await Server.findAll({
            where: { createdBy: req.user.id },
            attributes: ['discordId']
        });

        const configuredIds = configuredServers.map(s => s.discordId);

        // 4. Filtrer : user owner + bot présent + pas déjà configuré
        const filtered = userGuilds.filter(guild =>
            guild.owner === true &&
            botGuildIds.includes(guild.id) &&
            !configuredIds.includes(guild.id)
        );

        res.json(filtered);
    } catch (err) {
        console.error('Error fetching Discord guilds:', err.message);
        const status = err.message.includes('expired') ? 401 : 400;
        res.status(status).json({ error: err.message });
    }
};

exports.getSpecificGuild = async (req, res) => {
    const guildId = req.params.guildId;

    try {
        const response = await get(`https://discord.com/api/guilds/${guildId}`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });

        const { id, name, icon } = response.data;

        res.json({ id, name, icon });
    } catch (err) {
        console.error('Erreur lors de la récupération du serveur:', err.message);
        res.status(400).json({ error: 'Impossible de récupérer les infos du serveur.' });
    }
}

exports.getGuildChannels = async (req, res) => {
    const guildId = req.params.guildId;

    try {
        const channels = await getGuildChannels(req.user.id, guildId);
        res.json(channels);
    } catch (err) {
        console.error('[getGuildChannels] Error:', err.message);
        const status = err.message.includes('expiré') ? 401 : 400;
        res.status(status).json({ error: err.message });
    }
};