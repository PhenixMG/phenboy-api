// services/tokenService.js
const jwt = require('jsonwebtoken');

/**
 * Génère un access token JWT pour l'utilisateur
 */
function generateAccessToken(userId, role) {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // ou autre durée selon besoin
    );
}

/**
 * Génère un refresh token JWT avec un ID unique
 */
function generateRefreshToken(userId, tokenId) {
    return jwt.sign(
        { id: userId, jti: tokenId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = {
    generateAccessToken,
    generateRefreshToken
};