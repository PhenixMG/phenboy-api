const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * 👤 Utilisateur connecté.
 * Authentifié via Discord OAuth, avec rôles pour gestion des droits.
 *
 * @model User
 * @property {string} [discordId] - ID Discord (optionnel)
 * @property {string} username - Nom d'utilisateur unique
 * @property {string} [avatar] - URL de l'avatar Discord
 * @property {'user'|'mods'|'admin'} role - Rôle système
 * @association hasMany Post, Server, RefreshToken
 * @timestamps createdAt, updatedAt
 */
const User = sequelize.define('User', {
    discordId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true // Peut être vide si inscrit localement, mais unique si présent
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'mods', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    }
});

module.exports = User;
