const User = require('../models/User');
const ModerationLog = require('../models/ModerationLog');
const {sendWebhookToBot} = require("../services/webhookService");

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

exports.getSanctions = async (req, res) => {
    try {
        let discordId = req.query.discordId;
        const sanctions = await ModerationLog.findAll({
            attributes: { exclude: ['userId', 'serverId'] },
            where: {
                discordId: discordId
            }
        });
        res.json(sanctions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve sanctions list' });
    }
}

// Lors de la création d'une sanction
exports.createSanction = async (req, res) => {
    try {
        const sanction = await ModerationLog.create(req.body);

        await sendWebhookToBot('create', {
            id: sanction.id,
            userId: sanction.userId,
            serverId: sanction.serverId,
            duration: sanction.duration,
            timestamp: sanction.createdAt.toISOString()
        });

        res.status(201).json(sanction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lors de la mise à jour d'une sanction
exports.updateSanction = async (req, res) => {
    try {
        const sanction = await ModerationLog.findByPk(req.params.id);
        if (!sanction) return res.status(404).json({ error: 'Sanction non trouvée' });

        await sanction.update(req.body);

        await sendWebhookToBot('update', {
            id: sanction.id,
            userId: sanction.userId,
            serverId: sanction.serverId,
            duration: sanction.duration,
            timestamp: sanction.updatedAt.toISOString()
        });

        res.json(sanction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lors de la suppression d'une sanction
exports.deleteSanction = async (req, res) => {
    try {
        const sanction = await ModerationLog.findByPk(req.params.id);
        if (!sanction) return res.status(404).json({ error: 'Sanction non trouvée' });

        await sendWebhookToBot('delete', {
            id: sanction.id,
            userId: sanction.userId,
            serverId: sanction.serverId
        });

        await sanction.destroy();

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};