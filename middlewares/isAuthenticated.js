const jwt = require('jsonwebtoken');

module.exports = function isAuthenticated(req, res, next) {
    const botApiKey = process.env.BOT_API_KEY;
    const authHeader = req.headers.authorization;
    const refreshToken = req.cookies?.refreshToken;

    // 1. Bot Authentication (Authorization: Bearer <API_KEY>)
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token === botApiKey) {
            req.isBot = true;
            return next();
        }
    }

    // 2. User Authentication (Cookie refreshToken)
    if (refreshToken) {
        try {
            req.user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            req.isBot = false;
            return next();
        } catch (err) {
            return res.sendStatus(403); // Token invalide
        }
    }

    // 3. Aucun token valide
    return res.sendStatus(401);
};
