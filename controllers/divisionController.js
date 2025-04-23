const DivisionConfig = require('../models/DivisionConfig');
const Server = require('../models/Server');
const Td2Blacklist = require('../models/Td2Blacklist');
const Td2Activity = require('../models/Td2Activity');

const VALID_TYPES = ['activities', 'raids', 'incursions'];

/**
 * @swagger
 * /division/admin/servers/{id}/division/channels:
 *   get:
 *     summary: Récupère les salons configurés pour les activités The Division 2
 *     tags: [Admin - The Division 2]
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
 *         description: Objet des channels TD2 configurés
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.getDivisionChannels = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });

        if (!server.td2Enabled) {
            return res.status(403).json({ message: 'The Division 2 module is disabled for this server.' });
        }

        const configs = await DivisionConfig.findAll({ where: { serverId } });

        // Format objet { type: channelId }
        const formatted = {};
        configs.forEach(c => {
            formatted[c.type] = c.channelId;
        });

        res.json(formatted);
    } catch (err) {
        console.error('getDivisionChannels error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /division/admin/servers/{id}/division/channels:
 *   post:
 *     summary: Met à jour ou supprime un salon TD2 pour un type donné
 *     tags: [Admin - The Division 2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [activities, raids, incursions]
 *               channelId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Config mise à jour ou supprimée
 *       201:
 *         description: Nouvelle config créée
 *       400:
 *         description: Type invalide
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.setDivisionChannel = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { type, channelId } = req.body;

        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: `Invalid type. Allowed: ${VALID_TYPES.join(', ')}` });
        }

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });

        if (!server.td2Enabled) {
            return res.status(403).json({ message: 'The Division 2 module is disabled for this server.' });
        }

        // Suppression
        if (channelId === null) {
            await DivisionConfig.destroy({ where: { serverId, type } });
            return res.status(200).json({ message: `Config "${type}" removed.` });
        }

        // Ajout ou MAJ
        const [config, created] = await DivisionConfig.upsert(
            { serverId, type, channelId },
            { conflictFields: ['serverId', 'type'], returning: true }
        );

        res.status(created ? 201 : 200).json(config);
    } catch (err) {
        console.error('setDivisionChannel error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /division/admin/servers/{id}/division/blacklist:
 *   get:
 *     summary: Récupère la liste noire The Division 2 pour un serveur
 *     tags: [Admin - The Division 2]
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
 *         description: Liste des utilisateurs blacklistés
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.getBlacklist = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });
        if (!server.td2Enabled) return res.status(403).json({ message: 'TD2 module disabled' });

        const list = await Td2Blacklist.findAll({ where: { serverId }, order: [['createdAt', 'DESC']] });

        res.json(list);
    } catch (err) {
        console.error('getBlacklist error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /division/admin/servers/{id}/division/blacklist:
 *   post:
 *     summary: Ajoute un utilisateur à la blacklist TD2
 *     tags: [Admin - The Division 2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
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
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur ajouté à la blacklist
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.addToBlacklist = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { userId, modId, reason } = req.body;

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });
        if (!server.td2Enabled) return res.status(403).json({ message: 'TD2 module disabled' });

        const entry = await Td2Blacklist.create({
            serverId,
            userId,
            modId,
            reason
        });

        res.status(201).json(entry);
    } catch (err) {
        console.error('addToBlacklist error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /division/admin/servers/{id}/division/blacklist/{userId}:
 *   delete:
 *     summary: Retire un utilisateur de la blacklist TD2
 *     tags: [Admin - The Division 2]
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
 *         description: Utilisateur retiré de la blacklist
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.removeFromBlacklist = async (req, res) => {
    try {
        const serverId = req.params.id;
        const userId = req.params.userId;

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });
        if (!server.td2Enabled) return res.status(403).json({ message: 'TD2 module disabled' });

        const deleted = await Td2Blacklist.destroy({ where: { serverId, userId } });

        res.json({ message: deleted ? 'Removed from blacklist' : 'User not found in blacklist' });
    } catch (err) {
        console.error('removeFromBlacklist error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /division/admin/servers/{id}/division/activities:
 *   get:
 *     summary: Récupère la liste des activités TD2 planifiées pour un serveur
 *     tags: [Admin - The Division 2]
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
 *         description: Liste des activités
 *       403:
 *         description: Accès refusé ou module désactivé
 *       500:
 *         description: Erreur interne
 */
exports.getActivities = async (req, res) => {
    try {
        const serverId = req.params.id;

        const server = await Server.findOne({ where: { id: serverId, createdBy: req.user.id } });
        if (!server) return res.status(403).json({ message: 'Unauthorized' });
        if (!server.td2Enabled) return res.status(403).json({ message: 'TD2 module disabled' });

        const list = await Td2Activity.findAll({
            where: { serverId },
            order: [['scheduledAt', 'ASC']]
        });

        res.json(list);
    } catch (err) {
        console.error('getActivities error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
