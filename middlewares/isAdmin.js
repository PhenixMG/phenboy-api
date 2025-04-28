module.exports = function isAdmin(req, res, next) {
    if (req.isBot) {
        return next(); // C'est le bot, accès autorisé
    }

    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    next();
};