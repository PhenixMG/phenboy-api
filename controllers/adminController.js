const ChannelConfig = require('../models/ChannelConfig');
const Server = require('../models/Server');

/**
 * Types valides de salons configurables.
 * @type {string[]}
 */
const VALID_TYPES = ['log', 'welcome', 'goodbye', 'announcement'];

/**
 * @swagger
 * /admin/servers/{id}/channels:
 *   get:
 *     summary: Récupère la configuration des salons personnalisés d'un serveur
 *     tags: [Admin - Channels]
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
 *         description: Objet contenant les types de salons et leurs channelId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 log: "123456"
 *                 welcome: "7891011"
 *                 goodbye: "11121314"
 *       403:
 *         description: L'utilisateur n'est pas propriétaire du serveur
 *       500:
 *         description: Erreur interne
 */
exports.getServerChannels = async (req, res) => {
    try {
        const serverId = req.params.id;

        // Vérifie si le serveur appartient à l'utilisateur connecté
        const server = await Server.findOne({
            where: {
                id: serverId,
                createdBy: req.user.id
            }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        const configs = await ChannelConfig.findAll({ where: { serverId } });

        // Formate les données en objet clé-valeur (type => channelId)
        const response = {};
        configs.forEach(config => {
            response[config.type] = config.channelId;
        });

        res.json(response);
    } catch (err) {
        console.error('getServerChannels error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/channels:
 *   post:
 *     summary: Ajoute ou met à jour la configuration d'un type de salon
 *     tags: [Admin - Channels]
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
 *               type:
 *                 type: string
 *                 enum: [log, welcome, goodbye, announcement]
 *               channelId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Config mise à jour avec succès
 *       201:
 *         description: Nouvelle config créée avec succès
 *       400:
 *         description: Type invalide
 *       403:
 *         description: L'utilisateur n'est pas propriétaire du serveur
 *       500:
 *         description: Erreur interne
 */
exports.setServerChannel = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { type, channelId } = req.body;

        // Valide le type
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: `Type invalide. Doit être l’un de : ${VALID_TYPES.join(', ')}` });
        }

        // Vérifie que l'utilisateur est bien créateur du serveur
        const server = await Server.findOne({
            where: {
                id: serverId,
                createdBy: req.user.id
            }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        // Si channelId est null → supprimer la config existante
        if (channelId === null) {
            const deleted = await ChannelConfig.destroy({
                where: { serverId, type }
            });

            return res.status(200).json({
                message: deleted
                    ? `Le salon de type "${type}" a été supprimé.`
                    : `Aucune configuration "${type}" à supprimer.`
            });
        }

        // Sinon → upsert (créer ou mettre à jour)
        const [config, created] = await ChannelConfig.upsert(
            { serverId, type, channelId },
            { returning: true, conflictFields: ['serverId', 'type'] }
        );

        return res.status(created ? 201 : 200).json(config);
    } catch (err) {
        console.error('setServerChannel error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
