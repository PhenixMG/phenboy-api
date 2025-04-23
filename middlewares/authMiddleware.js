const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification.
 * Vérifie qu’un token JWT est présent et valide.
 * Injecte `req.user = { id, role }` si succès.
 *
 * @middleware
 * @returns {401} Unauthorized si token absent ou invalide
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * Middleware d'autorisation basé sur le rôle de l'utilisateur.
 * À utiliser après `authMiddleware`.
 *
 * @param  {...string} roles - Rôles autorisés (ex: "admin", "mods")
 * @returns Middleware Express
 *
 * @example
 * router.post('/admin-only', authMiddleware, authorizeRoles('admin'), handler)
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient rights' });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    authorizeRoles
};
