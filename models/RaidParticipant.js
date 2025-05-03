// --------------------------------------------------------
// Ce modèle représente un participant à un raid Discord.
// Chaque participant est associé à un Raid, et possède un rôle et un statut.
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

// Définition du modèle RaidParticipant
const RaidParticipant = sequelize.define('RaidParticipant', {
    // Clé primaire UUID auto-générée pour chaque participant
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    // Clé étrangère vers le raid associé
    raidId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'raids',   // Nom de la table SQL correspondant au modèle Raid
            key: 'id'
        },
        onDelete: 'CASCADE',  // Suppression en cascade si le raid est supprimé
        onUpdate: 'CASCADE'   // Mise à jour en cascade si l'id du raid change
    },

    // Identifiant du joueur (ID Discord ou autre)
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // Rôle du joueur dans le raid (DPS, Heal ou Tank)
    role: {
        type: DataTypes.ENUM('DPS', 'Heal', 'Tank'),
        allowNull: false,
    },

    // Statut de participation :
    // - Confirmed : joueur engagé dans les 8
    // - Unavailable : indisponible
    // - Late : retardataire
    // - Substitute : suppléant non compté dans les 8
    status: {
        type: DataTypes.ENUM('Confirmé', 'Indisponible', 'En retard', 'Suppléant'),
        allowNull: false,
        defaultValue: 'Confirmé', // Par défaut, un nouvel entrant est "Confirmed"
    }
}, {
    // Nom de la table en base
    tableName: 'raid_participants',
    // Ajout des colonnes createdAt et updatedAt automatiquement
    timestamps: true,

    // Index pour optimiser les requêtes filtrant par raidId et statut
    indexes: [
        {
            name: 'raid_status_idx',
            fields: ['raidId', 'status']
        }
    ]
});

// Export du modèle pour utilisation dans le reste de l'application
module.exports = RaidParticipant;
