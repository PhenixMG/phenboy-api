const User = require('../models/User');
const Server = require('../models/Server');
const { Op } = require('sequelize');
const MemberSnapshot = require('../models/MemberSnapshot');
const ModerationLog = require('../models/ModerationLog');
const ServerChannelConfig = require('../models/ServerChannelConfig');
/**
 * Récupère le profil de l'utilisateur connecté (via JWT)
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.sendStatus(404);

        const userData = user.toJSON();

        // Supprimer les champs sensibles manuellement
        delete userData.discordAccessToken;
        delete userData.discordTokenExpiresAt;

        res.json(userData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
};

/**
 * Récupére les serveurs déjà configurés de l'utilisateur
 */
exports.getUserConfiguredServers = async (req, res) => {
    try {
        console.log('pok')
        const user = await User.findByPk(req.user.id, {
            include: { model: Server, as: 'Servers' } // ou 'guilds', selon ton association
        });

        if (!user) return res.sendStatus(404);

        res.json(user.Servers); // ou user.guilds selon ton modèle
    } catch (err) {
        console.error('[getUserConfiguredServers] Error:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des serveurs' });
    }
};

/**
 * Récupération de tous les utilisateurs (admin only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['discordAccessToken', 'discordTokenExpiresAt'] }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user list' });
    }
};

exports.saveGuildConfiguration = async (req, res) => {
    const serverId = req.params.serverId;
    const { config = [], moduleEnabled } = req.body;
    console.log(serverId)

    try {
        // Vérifie que le serveur appartient bien à l'utilisateur
        let server = await Server.findByPk(serverId);

        // Si le serveur n'existe pas encore, on le crée
        if (!server) {
            server = await Server.create({
                discordId: serverId,
                createdBy: req.user.id,
                name: req.body.guildName || 'Unknown',
                icon: req.body.guildIcon || null,
                td2Enabled: moduleEnabled || false
            });
        } else {
            // Sinon on vérifie que c'est bien le créateur qui veut le modifier
            if (server.createdBy !== req.user.id) {
                return res.status(403).json({ message: "Vous n'avez pas accès à ce serveur." });
            }

            // Mise à jour du flag TD2
            server.td2Enabled = moduleEnabled;
            await server.save();
        }

        // Supprimer les anciennes configs pour éviter les doublons
        await ServerChannelConfig.destroy({ where: { serverId: server.id } });

        // Créer les nouvelles
        const entries = config.map(cfg => ({
            ...cfg,
            serverId: server.id,
        }));

        await ServerChannelConfig.bulkCreate(entries);

        res.status(200).json({ message: 'Configuration enregistrée avec succès.' });

    } catch (err) {
        console.error('[saveGuildConfiguration] Error:', err);
        res.status(500).json({ error: 'Erreur lors de la sauvegarde de la configuration.' });
    }
};

exports.getDashboardData = async (req, res) => {
    const serverId = req.params.id;
    const userId = req.user.id;

    try {
        // Vérifie que l'utilisateur a accès
        const server = await Server.findByPk(serverId);
        if (!server || server.createdBy !== userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        // 1. MemberSnapshot (7 derniers jours)
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6); // Inclut aujourd'hui

        const snapshots = await MemberSnapshot.findAll({
            where: {
                serverId,
                createdAt: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            order: [['createdAt', 'ASC']]
        });

        const memberStats = snapshots.map(snap => ({
            date: snap.createdAt.toISOString().split('T')[0],
            count: snap.memberCount
        }));

        // 2. Logs de modération
        const moderationLogs = await ModerationLog.findAll({
            where: { serverId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        // 3. Configs
        const config = await ServerChannelConfig.findAll({
            where: { serverId },
            attributes: ['scope', 'type', 'channelId']
        });

        res.json({
            memberStats,
            moderationLogs,
            config
        });
    } catch (err) {
        console.error('[getDashboardData] Error:', err);
        res.status(500).json({ error: 'Erreur lors du chargement du dashboard' });
    }
};