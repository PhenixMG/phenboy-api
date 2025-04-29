// --------------------------------------------------------
// 👥 Modèle représentant un participant à une activité Discord.
// Chaque participant est associé à une activité (Activity).
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Activity = require('./Activity'); // Pour la clé étrangère vers Activity

// Définition du modèle ActivityParticipant
const ActivityParticipant = sequelize.define('ActivityParticipant', {
    /**
     * Clé primaire UUID auto-générée pour chaque participant
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    /**
     * Clé étrangère vers l'activité associée
     */
    activityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'activities',  // Table SQL 'activities'
            key: 'id'
        },
        onDelete: 'CASCADE',  // Supprime le participant si l'activité est supprimée
        onUpdate: 'CASCADE',  // Met à jour en cascade si l'ID change
        comment: 'Référence à l\'activité (FK)'
    },

    /**
     * ID Discord (ou autre) de l'utilisateur participant
     */
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID Discord de l\'utilisateur participant'
    }
}, {
    // Options du modèle
    tableName: 'activity_participants',  // Nom de la table en base
    timestamps: true,                    // Ajoute createdAt et updatedAt
    comment: 'Participants associés à une activité Discord'
});

module.exports = ActivityParticipant;
