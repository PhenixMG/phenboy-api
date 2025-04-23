const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * 🔐 Refresh token JWT stocké côté backend.
 * Permet de régénérer un access token sécurisé.
 * Chaque token correspond à une session utilisateur.
 *
 * @model RefreshToken
 * @property {string} token - ID unique (JTI) du token JWT
 * @property {Date} expiresAt - Date d’expiration de la session
 * @association belongsTo User
 * @timestamps createdAt, updatedAt (désactivés par défaut ici)
 */
const RefreshToken = sequelize.define('RefreshToken', {
    token: {
        type: DataTypes.STRING,
        allowNull: false, // Identifiant unique du token
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false, // Date d'expiration absolue
    }
});

module.exports = RefreshToken;
