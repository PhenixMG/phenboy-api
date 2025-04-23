const MemberSnapshot = require('../models/MemberSnapshot');
const Server = require('../models/Server');

/**
 * @swagger
 * /admin/servers/{id}/stats/members:
 *   get:
 *     summary: Récupère les statistiques historiques de membres d'un serveur
 *     tags: [Admin - Stats]
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
 *         description: Liste des snapshots journaliers de membres
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.getMemberStats = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const snapshots = await MemberSnapshot.findAll({
            where: { serverId },
            order: [['date', 'ASC']]
        });

        res.json(snapshots);
    } catch (err) {
        console.error('getMemberStats error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/stats/members:
 *   post:
 *     summary: Ajoute ou met à jour un snapshot de nombre de membres pour aujourd'hui
 *     tags: [Admin - Stats]
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
 *               count:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Snapshot mis à jour
 *       201:
 *         description: Nouveau snapshot ajouté
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.addSnapshot = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { count } = req.body;

        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const [snapshot, created] = await MemberSnapshot.upsert(
            { serverId, date: today, count },
            { returning: true, conflictFields: ['serverId', 'date'] }
        );

        res.status(created ? 201 : 200).json(snapshot);
    } catch (err) {
        console.error('addSnapshot error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/stats/members/latest:
 *   get:
 *     summary: Récupère le dernier snapshot de nombre de membres pour un serveur
 *     tags: [Admin - Stats]
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
 *         description: Dernier snapshot de membres
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Aucun snapshot trouvé
 *       500:
 *         description: Erreur interne
 */
exports.getLatestSnapshot = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const latest = await MemberSnapshot.findOne({
            where: { serverId },
            order: [['date', 'DESC']]
        });

        if (!latest) {
            return res.status(404).json({ message: 'No snapshot found.' });
        }

        res.json(latest);
    } catch (err) {
        console.error('getLatestSnapshot error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
