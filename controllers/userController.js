const { User } = require('../models/User');

/**
 * Récupère le profil de l'utilisateur connecté (via JWT)
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.sendStatus(404);

        // Ne jamais renvoyer le token Discord
        const { discordAccessToken, discordTokenExpiresAt, ...safeUser } = user.toJSON();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
};

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
