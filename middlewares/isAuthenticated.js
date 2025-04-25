const jwt = require('jsonwebtoken');

module.exports = function isAuthenticated(req, res, next) {
    const token = req.cookies?.refreshToken;
    if (!token) return res.sendStatus(401);


    try {
        req.user = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        next();
    } catch (err) {
        return res.sendStatus(403);
    }
};