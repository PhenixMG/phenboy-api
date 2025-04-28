// controllers/raidController.js
const { Raid } = require('../models/Raid');
const { RaidParticipant } = require('../models/RaidParticipant');
// Si tu as un service pour envoyer les pings
// const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

// ----- CRUD pour les Raids -----

/**
 * Create a new Raid
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
            serverId
        } = req.body;

        const raid = await Raid.create({
            announcementCreatorId,
            name,
            launchDate,
            raidCreatorId,
            zone,
            threadId,
            messageId,
            serverId
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
        const raids = await Raid.findAll({ include: ['participants', 'server'] });
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

// Note: La notification 15min avant est gérée par le hook Sequelize dans le modèle Raid.
