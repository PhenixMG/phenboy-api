const User = require('../models/User');

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
