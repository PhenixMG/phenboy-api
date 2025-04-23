const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 🧬 Progression d’un utilisateur sur un serveur donné.
 * Permet de gérer l’XP et le niveau dans un système de gamification.
 *
 * @model UserLevel
 * @property {string} userId - ID Discord de l'utilisateur concerné
 * @property {number} xp - Points d’expérience (XP)
 * @property {number} level - Niveau actuel
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const UserLevel = sequelize.define('UserLevel', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false // Nécessaire pour lier à un membre Discord
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true
});

module.exports = UserLevel;
