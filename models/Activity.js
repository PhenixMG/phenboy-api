// --------------------------------------------------------
// 🎯 Modèle représentant une activité planifiée sur un serveur Discord.
// Une activité est créée par un utilisateur et appartient à un serveur.
// Les participants sont gérés via une association hasMany vers ActivityParticipant.
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server'); // Pour la clé étrangère vers Server

const Activity = sequelize.define('Activity', {
    /**
     * Identifiant personnalisé utilisé pour les boutons d'interaction Discord
     */
    customId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: "Identifiant unique pour les boutons d'interaction"
    },

    /**
     * ID Discord (ou autre) de l'utilisateur qui a créé l'activité
     */
    creatorId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "ID Discord du créateur de l'activité"
    },

    /**
     * Date et heure de lancement de l'activité
     */
    launchDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Horodatage du lancement'
    },

    /**
     * Zone ou lieu de l'activité (ex: donjon, mission, salle de raid)
     */
    zone: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Zone où se déroule l'activité"
    },

    /**
     * Type d'activité (ex: "donjon", "quête", "épreuve")
     */
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Catégorie ou type d'activité"
    },

    /**
     * ID du thread si l'activité est postée dans un forum Discord
     */
    threadId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID du thread (si le salon est un forum)"
    },

    /**
     * ID du message contenant l'embed de l'activité
     */
    messageId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID du message (embed) pour modification ultérieure"
    },

    /**
     * Indique si la notification aux participants a déjà été envoyée
     */
    isNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Flag indiquant si les participants ont été notifiés"
    },

    /**
     * Clé étrangère vers le serveur Discord propriétaire de l'activité
     */
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Server,   // Table SQL 'Servers'
            key: 'id'
        },
        onDelete: 'CASCADE',  // Supprime l'activité si le serveur est supprimé
        onUpdate: 'CASCADE',  // Met à jour en cascade si l'ID du serveur change
        comment: "Référence au serveur (FK)"
    }
}, {
    // ----------------------------------------------------
    // Options du modèle
    // ----------------------------------------------------
    tableName: 'activities',    // Nom de la table en base
    timestamps: true,           // Ajoute createdAt et updatedAt automatiquement
    comment: 'Activités planifiées par serveur Discord'
});

module.exports = Activity;
