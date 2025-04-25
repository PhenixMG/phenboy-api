const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * 🧩 Configuration unique des salons Discord pour un serveur.
 * Peut servir pour les salons de logs, d'accueil, ou pour des modules (ex: Division 2).
 *
 * @model ServerChannelConfig
 * @property {'core'|'division'} scope - Domaine fonctionnel (général ou module spécifique)
 * @property {string} type - Type de configuration (log, raids, welcome...)
 * @property {string} channelId - ID du salon Discord
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const ServerChannelConfig = sequelize.define('ServerChannelConfig', {
    scope: {
        type: DataTypes.ENUM('core', 'division'),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(
            // Core
            'log', 'welcome', 'goodbye', 'announcement',
            // Division 2
            'raids', 'incursions', 'activities', 'blacklist'
        ),
        allowNull: false
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serverId: {
        type: DataTypes.INTEGER, // Vu que server.id est auto_increment
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = ServerChannelConfig;
