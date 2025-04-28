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

exports.saveGuildConfiguration = async (req, res) => {
    const serverId = req.params.serverId;
    const { config = [], moduleEnabled } = req.body;
    console.log(serverId)

    try {
        // Vérifie que le serveur appartient bien à l'utilisateur
        let server = await Server.findOne({
            where: {
                discordId: serverId,
            }
        });

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
    const serverId = req.params.serverId;
    const userId = req.user.id;

    try {
        console.log(serverId)
        const server = await Server.findByPk(serverId);
        console.log(server)
        if (!server || server.createdBy !== userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        // 📈 MemberSnapshot sur 7 jours
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);

        const snapshots = await MemberSnapshot.findAll({
            where: {
                serverId,
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            order: [['createdAt', 'ASC']]
        });

        const memberStats = snapshots.map(snap => ({
            date: snap.createdAt.toISOString().split('T')[0],
            count: snap.memberCount
        }));

        // 🚨 Moderation logs
        const moderationLogs = await ModerationLog.findAll({
            where: { serverId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        // ⚙️ Config salons
        const config = await ServerChannelConfig.findAll({
            where: { serverId },
            attributes: ['scope', 'type', 'channelId']
        });

        // 🎮 TD2 - Si activé
        let td2Data = null;
        if (server.td2Enabled) {

            // td2Data = {
            //     activities,
            //     blacklist
            // };
        }

        res.json({
            memberStats,
            moderationLogs,
            config,
            server: {
                td2Enabled: server.td2Enabled
            },
            td2: td2Data // <--- envoyé que si activé
        });

    } catch (err) {
        console.error('[getDashboardData] Error:', err);
        res.status(500).json({ error: 'Erreur lors du chargement du dashboard' });
    }
};