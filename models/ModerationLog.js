const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * ⚖️ Log d'une action de modération effectuée sur un serveur Discord.
 * Sert à tracer les actions administratives.
 *
 * @model ModerationLog
 * @property {string} userId - ID Discord de l'utilisateur ciblé
 * @property {string} modId - ID Discord du modérateur
 * @property {'mute'|'warn'|'ban'|'kick'} action - Type d'action de modération
 * @property {string} [reason] - Motif de l'action (facultatif)
 * @property {Date} timestamp - Date de l'action (défaut = NOW)
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const ModerationLog = sequelize.define('ModerationLog', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('mute', 'warn', 'ban', 'kick'),
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    duration: {
        type: DataTypes.INTEGER, // en secondes par exemple
        allowNull: true,          // null = permanent
    }
}, {
    timestamps: true
});

module.exports = ModerationLog;
