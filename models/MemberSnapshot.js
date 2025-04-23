const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

/**
 * 📊 Snapshot journalier du nombre de membres sur un serveur Discord.
 * Utilisé pour générer des statistiques d'évolution.
 *
 * @model MemberSnapshot
 * @property {number} count - Nombre d’utilisateurs à cette date
 * @property {string} date - Date du snapshot (format YYYY-MM-DD)
 * @association belongsTo Server
 * @timestamps createdAt, updatedAt
 */
const MemberSnapshot = sequelize.define('MemberSnapshot', {
    count: {
        type: DataTypes.INTEGER,
        allowNull: false // Nombre total de membres
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false // Format YYYY-MM-DD
    }
}, {
    timestamps: true
});

module.exports = MemberSnapshot;
