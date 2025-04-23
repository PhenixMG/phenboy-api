const ModerationLog = require('../models/ModerationLog');
const Server = require('../models/Server');

const ALLOWED_ACTIONS = ['mute', 'warn', 'ban', 'kick'];

/**
 * @swagger
 * /admin/servers/{id}/modlogs:
 *   get:
 *     summary: Récupère l'historique de toutes les actions de modération d'un serveur
 *     tags: [Admin - Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du serveur
 *     responses:
 *       200:
 *         description: Liste des logs de modération
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.getModerationLogs = async (req, res) => {
    try {
        const serverId = req.params.id;

        // Vérifie que l'utilisateur est bien le créateur du serveur
        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const logs = await ModerationLog.findAll({
            where: { serverId },
            order: [['createdAt', 'DESC']]
        });

        res.json(logs);
    } catch (err) {
        console.error('getModerationLogs error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/modlogs:
 *   post:
 *     summary: Ajoute un log de modération à un serveur
 *     tags: [Admin - Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du serveur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               modId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [mute, warn, ban, kick]
 *               reason:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Log créé
 *       400:
 *         description: Action invalide
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.addModerationLog = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { userId, modId, action, reason, timestamp } = req.body;

        // Vérification du type d'action
        if (!ALLOWED_ACTIONS.includes(action)) {
            return res.status(400).json({ message: 'Action type invalid.' });
        }

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const log = await ModerationLog.create({
            serverId,
            userId,
            modId,
            action,
            reason,
            timestamp
        });

        res.status(201).json(log);
    } catch (err) {
        console.error('addModerationLog error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/modlogs/grouped:
 *   get:
 *     summary: Récupère les logs de modération groupés par utilisateur
 *     tags: [Admin - Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du serveur
 *     responses:
 *       200:
 *         description: Logs groupés par utilisateur
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.getModerationLogsGrouped = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const logs = await ModerationLog.findAll({
            where: { serverId },
            order: [['createdAt', 'DESC']]
        });

        // Groupement par userId
        const grouped = {};
        logs.forEach(log => {
            const userId = log.userId;
            if (!grouped[userId]) grouped[userId] = [];
            grouped[userId].push(log);
        });

        res.json(grouped);
    } catch (err) {
        console.error('getModerationLogsGrouped error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
