const jwt = require('jsonwebtoken');

// Vérifie que l'utilisateur est authentifié
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

// Vérifie que l'utilisateur a un rôle autorisé
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
