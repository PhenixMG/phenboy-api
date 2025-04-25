// services/discordService.js
require('dotenv').config()
const axios = require('axios');
const User = require('../models/User'); // adapte le chemin si besoin

/**
 * Helper pour logger les erreurs Discord
 */
function logDiscordError(context, err) {
    const msg = err.response?.data || err.message;
    console.error(`[DiscordService] ${context} failed:`, msg);
}

/**
 * Check si le token Discord est encore valide
 */
function isTokenExpired(user) {
    return !user.discordAccessToken || !user.discordTokenExpiresAt || new Date() > user.discordTokenExpiresAt;
}

/**
 * Supprime les tokens Discord d’un utilisateur
 */
async function revokeDiscordToken(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    user.discordAccessToken = null;
    user.discordTokenExpiresAt = null;
    await user.save();
    console.log(`[DiscordService] Revoked Discord token for user ${userId}`);
}

/**
 * Récupère des données depuis un endpoint Discord
 */
async function fetchDiscord(userId, endpoint, guildId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (isTokenExpired(user)) {
        await revokeDiscordToken(userId);
        throw new Error('Discord token expired');
    }

    try {
        const response = await axios.get(`https://discord.com/api${endpoint}`, {
            headers: { Authorization: `Bearer ${user.discordAccessToken}` }
        });
        return response.data;
    } catch (err) {
        if (err.response?.status === 401) {
            await revokeDiscordToken(userId);
            throw new Error('Invalid or expired Discord token');
        }
        logDiscordError(`fetch ${endpoint}`, err);
        throw err;
    }
}
/**
 * Exemple: récupérer les serveurs de l'utilisateur
 */
async function getUserGuilds(userId) {
    return fetchDiscord(userId, '/users/@me/guilds');
}

async function getGuildChannels(userId, guildId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Utilisateur introuvable');

    if (isTokenExpired(user)) {
        await revokeDiscordToken(userId);
        throw new Error('Token Discord expiré');
    }

    try {
        console.log(user.discordAccessToken)
        const response = await axios.get(`https://discord.com/api/guilds/${guildId}/channels`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        return response.data;
    } catch (err) {
        if (err.response?.status === 401) {
            await revokeDiscordToken(userId);
        }
        logDiscordError(`fetch guild channels for ${guildId}`, err);
        throw err;
    }
}

module.exports = {
    getUserGuilds,
    getGuildChannels,
    revokeDiscordToken,
    isTokenExpired
};
