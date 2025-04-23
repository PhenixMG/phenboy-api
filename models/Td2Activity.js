const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 🎮 Activité planifiée dans le module The Division 2.
 * Chaque activité (raid, incursion, event) est liée à un serveur.
 *
 * @model Td2Activity
 * @property {'raid'|'incursion'|'event'} type - Type d’activité
 * @property {string} title - Titre de l’activité
 * @property {Date} scheduledAt - Date/heure prévue
 * @property {string} [description] - Détails facultatifs
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const Td2Activity = sequelize.define('Td2Activity', {
    type: {
        type: DataTypes.ENUM('raid', 'incursion', 'event'),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Td2Activity;
