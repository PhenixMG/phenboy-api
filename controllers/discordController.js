const discordService = require('../services/discordService');
const {get} = require("axios");
const { User } = require('../models/User');

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
        // 1. Guilds de l'utilisateur
        const userGuilds = await discordService.getUserGuilds(req.user.id);

        // 2. Guilds du bot
        const botGuildResponse = await get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: process.env.DISCORD_BOT_TOKEN
            }
        });

        const botGuildIds = botGuildResponse.data.map(g => g.id);

        // 3. Filtrer les guilds où user est owner et bot est présent
        const filtered = userGuilds.filter(guild =>
            guild.owner === true && botGuildIds.includes(guild.id)
        );

        res.json(filtered);
    } catch (err) {
        console.error('Error fetching Discord guilds:', err.message);
        res.status(400).json({ error: err.message });
    }
};