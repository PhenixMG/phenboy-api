const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 🛡️ Configuration des salons pour le module The Division 2.
 * Chaque config associe un type d’activité à un salon Discord spécifique.
 *
 * @model DivisionConfig
 * @property {'activities'|'raids'|'incursions'} type - Type de contenu Division 2
 * @property {string} channelId - ID du salon Discord assigné à ce type
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const DivisionConfig = sequelize.define('DivisionConfig', {
    type: {
        type: DataTypes.ENUM('activities', 'raids', 'incursions'),
        allowNull: false // Type spécifique d'activité Division 2
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: false // ID du salon Discord concerné
    }
}, {
    timestamps: true // Active createdAt et updatedAt
});

module.exports = DivisionConfig;
