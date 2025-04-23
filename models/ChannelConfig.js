const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 🎛️ Configuration des salons spéciaux pour un serveur Discord.
 * Chaque ligne représente un type de salon (log, welcome, goodbye, announcement).
 *
 * @model ChannelConfig
 * @property {'log'|'welcome'|'goodbye'|'announcement'} type - Type de salon configuré
 * @property {string} channelId - ID du salon Discord
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const ChannelConfig = sequelize.define('ChannelConfig', {
    type: {
        type: DataTypes.ENUM('log', 'welcome', 'goodbye', 'announcement'),
        allowNull: false // Obligatoire pour identifier la fonctionnalité
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: false // ID Discord du salon lié
    }
}, {
    timestamps: true
});

// 🔗 Relation gérée dans le controller d’associations
module.exports = ChannelConfig;
