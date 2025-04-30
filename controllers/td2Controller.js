// controllers/raidController.js
const  Raid = require('../models/Raid');
const RaidParticipant = require('../models/RaidParticipant');
const Activity = require('../models/Activity');
const ActivityParticipant = require('../models/ActivityParticipant');
const Incursion = require('../models/Incursion');
const IncursionParticipant = require('../models/IncursionParticipant');
const Server = require('../models/Server');
const {Op} = require("sequelize");
// Si tu as un service pour envoyer les pings
// const notificationService = require('../services/notificationService');

// ----- CRUD pour les Raids -----

/**
 * Create a new Raid
 * Expects in req.body:
 *   - announcementCreatorId, name, launchDate, raidCreatorId, zone,
 *   - threadId, messageId,
 *   - guildId (== discordId du serveur)
 */
exports.createRaid = async (req, res) => {
    try {
        const {
            announcementCreatorId,
            name,
            launchDate,
            raidCreatorId,
            zone,
            threadId,
            messageId,
            guildId       // on récupère ici l'ID Discord du serveur
        } = req.body;

        console.log(guildId)
        // (1) On cherche le serveur en base via son discordId
        const server = await Server.findOne({
            where: { discordId: guildId }
        });
        if (!server) {
            return res.status(404).json({ error: `Serveur introuvable pour guildId : ${guildId}` });
        }

        // (2) On crée le raid avec serverId issu du serveur trouvé
        const raid = await Raid.create({
            announcementCreatorId,
            name,
            launchDate,
            raidCreatorId,
            zone,
            threadId,
            messageId,
            serverId: server.id   // utilisation de l'ID interne
        });

        // Le hook Sequelize afterCreate appelle scheduleReminder

        return res.status(201).json(raid);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Get all Raids
 */
exports.getAllRaids = async (req, res) => {
    try {
        const { serverId, discordId } = req.query;

        // Construction du filtre pour Raid
        const where = {};
        if (serverId)   where.serverId = serverId;

        // Construction de l'include pour filtrer par discordId si besoin
        const include = [
            'participants'
        ];
        if (discordId) {
            include.push({
                model: Server,
                as: 'server',
                attributes: [],        // on n'en a pas besoin dans la réponse
                where: { discordId }
            });
        } else {
            include.push('server');
        }

        const raids = await Raid.findAll({ where, include });
        return res.json(raids);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single Raid by ID
 */
exports.getRaidById = async (req, res) => {
    try {
        const { id } = req.params;
        const raid = await Raid.findByPk(id, { include: ['participants', 'server'] });
        if (!raid) return res.status(404).json({ error: 'Raid not found' });
        return res.json(raid);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Update a Raid
 */
exports.updateRaid = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const raid = await Raid.findByPk(id);
        if (!raid) return res.status(404).json({ error: 'Raid not found' });

        Object.assign(raid, updates);
        await raid.save();

        // Le hook Sequelize afterUpdate (si launchDate modifié) appelle scheduleReminder

        return res.json(raid);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Delete a Raid
 */
exports.deleteRaid = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Raid.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Raid not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ----- Gestion des Participants -----

/**
 * Get all participants for a given Raid
 */
exports.getParticipants = async (req, res) => {
    try {
        const { raidId } = req.params;
        // Récupération directe des participants liés
        const participants = await RaidParticipant.findAll({ where: { raidId } });
        return res.json(participants);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Add a participant to a Raid
 */
exports.addParticipant = async (req, res) => {
    try {
        const { raidId } = req.params;
        const { userId, role, status = 'Confirmed' } = req.body;

        // Si on confirme, vérifier qu'il n'y a pas déjà 8 joueurs Confirmed
        if (status === 'Confirmed') {
            const count = await RaidParticipant.count({
                where: { raidId, status: 'Confirmed' }
            });
            if (count >= 8) {
                return res.status(400).json({ error: 'Le raid est déjà plein (8 joueurs Confirmed).' });
            }
        }

        const participant = await RaidParticipant.create({ raidId, userId, role, status });
        return res.status(201).json(participant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Update a participant's role or status
 */
exports.updateParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;

        const participant = await RaidParticipant.findByPk(id);
        if (!participant) return res.status(404).json({ error: 'Participant non trouvé' });

        // Vérif si status -> Confirmed
        if (status === 'Confirmed' && participant.status !== 'Confirmed') {
            const count = await RaidParticipant.count({
                where: { raidId: participant.raidId, status: 'Confirmed' }
            });
            if (count >= 8) {
                return res.status(400).json({ error: 'Le raid est déjà plein (8 joueurs Confirmed).' });
            }
        }

        if (role !== undefined) participant.role = role;
        if (status !== undefined) participant.status = status;
        await participant.save();

        return res.json(participant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Remove a participant from a Raid
 */
exports.removeParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await RaidParticipant.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Participant non trouvé' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ----- CRUD pour les Activités -----

/**
 * Create a new Activity
 */
exports.createActivity = async (req, res) => {
    try {
        const {
            guildId,
            creatorId,
            customId,
            name,
            type,
            launchDate,
            threadId    = null,
            messageId   = null,
            maxPlayers
        } = req.body;

        // 1) Résolution du serverId interne via le discordId (guildId)
        const server = await Server.findOne({ where: { discordId: guildId } });
        if (!server) {
            return res
                .status(404)
                .json({ error: `Serveur introuvable pour guildId : ${guildId}` });
        }

        // 2) Création de l’activité
        const activity = await Activity.create({
            customId,
            creatorId,
            name,
            type,
            launchDate,
            threadId,
            messageId,
            maxPlayers,
            serverId: server.id
            // isNotified prendra sa valeur par défaut (false)
        });

        return res.status(201).json(activity);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Get all Activities (optionnel: filtrer par serverId via req.query)
 */
exports.getAllActivities = async (req, res) => {
    try {
        const { serverId, discordId } = req.query;
        const where = {};
        if (serverId)   where.serverId = serverId;

        const include = [
            'participants'
        ];
        if (discordId) {
            include.push({
                model: Server,
                as: 'server',
                attributes: [],
                where: { discordId }
            });
        } else {
            include.push('server');
        }

        const activities = await Activity.findAll({ where, include });
        return res.json(activities);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single Activity by ID
 */
exports.getActivityById = async (req, res) => {
    try {
        const { id } = req.params;
        const activity = await Activity.findByPk(id, { include: ['participants', 'server'] });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        return res.json(activity);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single Activity by messageId
 */
exports.getActivityByMessageId = async (req, res) => {
    try {
        const messageId = req.params.id;
        const activity = await Activity.findOne({
            include: ['participants', 'server'],
            where: {
                messageId: messageId
            }
        });
        if (!activity) return res.status(404).json({ error: 'Activity not found' });
        return res.json(activity);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Update an Activity
 */
exports.updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const activity = await Activity.findByPk(id);
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        Object.assign(activity, updates);
        await activity.save();

        return res.json(activity);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Delete an Activity
 */
exports.deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Activity.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Activity not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Delete an activity by his messageId
 */
exports.deleteActivityByMessageId = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Activity.destroy({
            where: {
                messageId: id
            }
        })
        if (!deleted) return res.status(404).json({ error: 'Activity not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ----- Gestion des Participants d'Activité -----

/**
 * Get all participants for a given Activity
 */
exports.getActivityParticipants = async (req, res) => {
    try {
        const { activityId } = req.params;
        const participants = await ActivityParticipant.findAll({ where: { activityId } });
        return res.json(participants);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Add a participant to an Activity
 */
exports.addActivityParticipant = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { userId, ubisoftId } = req.body;

        if (!userId || !ubisoftId) {
            return res.status(400).json({ error: 'userId et ubisoftId sont requis.' });
        }

        // Vérifie que l'activité existe
        const activity = await Activity.findByPk(activityId);
        if (!activity) {
            return res.status(404).json({ error: 'Activité non trouvée.' });
        }

        // Vérifie si le userId ou ubisoftId est déjà inscrit
        const existing = await ActivityParticipant.findOne({
            where: {
                activityId,
                [Op.or]: [
                    { userId },
                    { ubisoftId }
                ]
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Participant déjà inscrit à cette activité.' });
        }

        // Création si OK
        const participant = await ActivityParticipant.create({
            activityId,
            userId,
            ubisoftId
        });

        return res.status(201).json(participant);
    } catch (error) {
        console.error('Erreur addActivityParticipant :', error);
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Remove a participant from an Activity
 */
exports.removeActivityParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ActivityParticipant.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Participant not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ----- CRUD pour les Incursions -----

/**
 * Crée une nouvelle incursion
 */
exports.createIncursion = async (req, res) => {
    try {
        const {
            customId,
            creatorId,
            launchDate,
            zone,
            threadId,
            messageId,
            serverId
        } = req.body;

        const incursion = await Incursion.create({
            customId,
            creatorId,
            launchDate,
            zone,
            threadId,
            messageId,
            serverId
        });

        return res.status(201).json(incursion);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Récupère toutes les incursions (optionnel: filtrer par serverId)
 */
exports.getAllIncursions = async (req, res) => {
    try {
        const { serverId } = req.query;
        const where = serverId ? { serverId } : {};

        const incursions = await Incursion.findAll({
            where,
            include: ['participants', 'server']
        });
        return res.json(incursions);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Récupère une seule incursion par son ID
 */
exports.getIncursionById = async (req, res) => {
    try {
        const { id } = req.params;
        const incursion = await Incursion.findByPk(id, {
            include: ['participants', 'server']
        });
        if (!incursion) return res.status(404).json({ error: 'Incursion non trouvée' });
        return res.json(incursion);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Met à jour une incursion existante
 */
exports.updateIncursion = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const incursion = await Incursion.findByPk(id);
        if (!incursion) return res.status(404).json({ error: 'Incursion non trouvée' });

        Object.assign(incursion, updates);
        await incursion.save();

        return res.json(incursion);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Supprime une incursion
 */
exports.deleteIncursion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Incursion.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Incursion non trouvée' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ----- Gestion des Participants d'Incursion -----

/**
 * Récupère tous les participants d'une incursion
 */
exports.getIncursionParticipants = async (req, res) => {
    try {
        const { incursionId } = req.params;
        const participants = await IncursionParticipant.findAll({ where: { incursionId } });
        return res.json(participants);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * Ajoute un participant à une incursion
 */
exports.addIncursionParticipant = async (req, res) => {
    try {
        const { incursionId } = req.params;
        const { userId, role, status = 'Confirmed' } = req.body;

        // Si statut "Confirmed", vérifier qu'il n'y a pas déjà 4 joueurs Confirmed
        if (status === 'Confirmed') {
            const count = await IncursionParticipant.count({
                where: { incursionId, status: 'Confirmed' }
            });
            if (count >= 4) {
                return res.status(400).json({ error: 'Incursion déjà complète (4 Confirmed).' });
            }
        }

        const participant = await IncursionParticipant.create({
            incursionId,
            userId,
            role,
            status
        });
        return res.status(201).json(participant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Met à jour le rôle ou le statut d'un participant d'incursion
 */
exports.updateIncursionParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;

        const participant = await IncursionParticipant.findByPk(id);
        if (!participant) return res.status(404).json({ error: 'Participant non trouvé' });

        // Si passage à "Confirmed", vérifier la limite des 4
        if (status === 'Confirmed' && participant.status !== 'Confirmed') {
            const count = await IncursionParticipant.count({
                where: { incursionId: participant.incursionId, status: 'Confirmed' }
            });
            if (count >= 4) {
                return res.status(400).json({ error: 'Incursion déjà complète (4 Confirmed).' });
            }
        }

        if (role !== undefined) participant.role = role;
        if (status !== undefined) participant.status = status;
        await participant.save();

        return res.json(participant);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

/**
 * Supprime un participant d'une incursion
 */
exports.removeIncursionParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await IncursionParticipant.destroy({ where: { id } });
        if (!deleted) return res.status(404).json({ error: 'Participant non trouvé' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
