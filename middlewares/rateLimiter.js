const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 10 * 1000, // 10 secondes
    max: 5,
    message: 'Trop de requêtes Discord, réessaie dans un instant'
});