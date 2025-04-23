const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 🚫 Utilisateur blacklisté dans le module The Division 2.
 * Permet d’exclure des membres de certaines activités.
 *
 * @model Td2Blacklist
 * @property {string} userId - ID Discord de l’utilisateur concerné
 * @property {string} [reason] - Motif de la mise en blacklist
 * @property {string} modId - ID Discord du modérateur ayant banni
 * @property {Date} timestamp - Date d’ajout en blacklist
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const Td2Blacklist = sequelize.define('Td2Blacklist', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    modId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true
});

module.exports = Td2Blacklist;
