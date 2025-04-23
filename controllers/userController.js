const User = require('../models/User');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupère la liste de tous les utilisateurs
 *     tags: [Public - Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   role:
 *                     type: string
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error('getAllUsers error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son ID
 *     tags: [Public - Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
exports.getOneUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        res.json(user);
    } catch (err) {
        next(err); // Passe l'erreur au gestionnaire global
    }
};
