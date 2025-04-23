const Server = require('../models/Server');
const {get} = require("axios");
const {getToken} = require("../services/discordTokenCache");

/**
 * @swagger
 * /admin/servers:
 *   get:
 *     summary: Liste tous les serveurs créés par l'utilisateur connecté
 *     tags: [Admin - Serveurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des serveurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   discordId:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       500:
 *         description: Erreur interne
 */
exports.getUserServers = async (req, res) => {
    try {
        const servers = await Server.findAll({
            where: { createdBy: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json(servers);
    } catch (err) {
        console.error('Erreur getUserServers:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers:
 *   post:
 *     summary: Ajoute un serveur à la liste de l'utilisateur
 *     tags: [Admin - Serveurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               discordId:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Serveur créé avec succès
 *       200:
 *         description: Serveur déjà existant retourné
 *       500:
 *         description: Erreur interne
 */
exports.addServer = async (req, res) => {
    try {
        const { name, discordId, icon } = req.body;

        const [server, created] = await Server.findOrCreate({
            where: { discordId },
            defaults: {
                name,
                icon,
                createdBy: req.user.id
            }
        });

        res.status(created ? 201 : 200).json(server);
    } catch (err) {
        console.error('addServer error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /admin/servers/{id}/modules/td2:
 *   patch:
 *     summary: Active ou désactive le module The Division 2
 *     tags: [Admin - Serveurs]
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
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: État du module mis à jour
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur interne
 */
exports.toggleTD2Module = async (req, res) => {
    try {
        const serverId = req.params.id;
        const { enabled } = req.body;

        const server = await Server.findOne({
            where: { id: serverId, createdBy: req.user.id }
        });

        if (!server) {
            return res.status(403).json({ message: 'You do not own this server.' });
        }

        server.td2Enabled = enabled;
        await server.save();

        res.json({
            message: `TD2 module ${enabled ? 'enabled' : 'disabled'}`,
            td2Enabled: server.td2Enabled
        });
    } catch (err) {
        console.error('toggleTD2Module error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Récupère les serveurs Discord où l'utilisateur est propriétaire
 * @route GET /discord/servers
 */
exports.getUserGuilds = async (req, res) => {
    console.log('called')
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const token = await getToken(userId);
    console.log(userId)

    if (!token) {
        return res.status(401).json({ message: 'Token Discord manquant ou expiré.' });
    }

    try {
        const response = await get('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('test')

        // Ne renvoyer que les serveurs où l'utilisateur est propriétaire
        const ownedGuilds = response.data.filter(guild => guild.owner);
        res.json(ownedGuilds);
    } catch (err) {
        console.error('Erreur Discord OAuth:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to fetch Discord guilds' });
    }
};