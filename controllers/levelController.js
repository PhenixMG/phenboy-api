const UserLevel = require('../models/UserLevel');
const Server = require('../models/Server');

/**
 * @swagger
 * /admin/servers/{id}/levels:
 *   get:
 *     summary: Récupère tous les niveaux des utilisateurs pour un serveur
 *     tags: [Admin - Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste triée des utilisateurs par XP
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.getLevels = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        // Récupération et tri décroissant par XP
        const levels = await UserLevel.findAll({
            where: { serverId },
            order: [['xp', 'DESC']]
        });

        res.json(levels);
    } catch (err) {
        console.error('getLevels error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/levels:
 *   post:
 *     summary: Met à jour ou crée le niveau d'un utilisateur pour un serveur
 *     tags: [Admin - Levels]
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
 *               level:
 *                 type: integer
 *               xp:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Niveau mis à jour
 *       201:
 *         description: Niveau créé
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.setUserLevel = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { userId, level, xp } = req.body;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        // Upsert (insert si nouveau, update sinon)
        const [record, created] = await UserLevel.upsert(
            { serverId, userId, level, xp },
            { returning: true, conflictFields: ['serverId', 'userId'] }
        );

        res.status(created ? 201 : 200).json(record);
    } catch (err) {
        console.error('setUserLevel error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/levels/{userId}:
 *   delete:
 *     summary: Réinitialise le niveau d'un utilisateur pour un serveur
 *     tags: [Admin - Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Niveau supprimé ou message informatif
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.resetUserLevel = async (req, res) => {
    try {
        const serverId = req.params.id;
        const userId = req.params.userId;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const deleted = await UserLevel.destroy({
            where: { serverId, userId }
        });

        res.status(200).json({
            message: deleted ? 'User level reset' : 'No level found for this user'
        });
    } catch (err) {
        console.error('resetUserLevel error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/levels/top:
 *   get:
 *     summary: Récupère le top 10 des utilisateurs par XP pour un serveur donné
 *     tags: [Admin - Levels]
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
 *         description: Liste des 10 meilleurs utilisateurs
 *       403:
 *         description: L'utilisateur n'est pas propriétaire du serveur
 *       500:
 *         description: Erreur interne
 */
exports.getTopLevels = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const topLevels = await UserLevel.findAll({
            where: { serverId },
            order: [['xp', 'DESC']],
            limit: 10
        });

        res.json(topLevels);
    } catch (err) {
        console.error('getTopLevels error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
