// --------------------------------------------------------
// 👥 Modèle représentant un participant à une incursion Discord.
// Maximun 4 joueurs "Confirmed" par incursion, rôles DPS/Heal/Tank.
// --------------------------------------------------------

const { DataTypes: D } = require('sequelize');
const { sequelize: db } = require('../db/database');
const IncursionModel = require('./Incursion');

const IncursionParticipant = db.define('IncursionParticipant', {
    /**
     * Clé primaire UUID
     */
    id: {
        type: D.UUID,
        defaultValue: D.UUIDV4,
        primaryKey: true
    },

    /**
     * Clé étrangère vers l'incursion associée
     */
    incursionId: {
        type: D.UUID,
        allowNull: false,
        references: { model: 'incursions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'FK vers Incursion'
    },

    /**
     * ID Discord du participant
     */
    userId: {
        type: D.STRING,
        allowNull: false,
        comment: 'ID Discord du participant'
    },

    /**
     * Rôle dans l'incursion
     */
    role: {
        type: D.ENUM('DPS', 'Heal', 'Tank'),
        allowNull: false,
        comment: 'Rôle du joueur'
    },

    /**
     * Statut de participation
     * - Confirmed  : compté dans les 4
     * - Unavailable: indisponible
     * - Late       : retardataire
     * - Substitute : suppléant (non compté)
     */
    status: {
        type: D.ENUM('Confirmed','Unavailable','Late','Substitute'),
        allowNull: false,
        defaultValue: 'Confirmed',
        comment: 'Statut de participation'
    }
}, {
    tableName: 'incursion_participants',
    timestamps: true,
    comment: 'Participants aux incursions',
    indexes: [
        { fields: ['incursionId','status'] }
    ]
});

module.exports = IncursionParticipant;
