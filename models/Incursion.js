// --------------------------------------------------------
// 🚀 Modèle représentant une incursion planifiée sur un serveur Discord.
// Une incursion est un contenu PvE pour 4 joueurs, avec rôles DPS, Heal, Tank.
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

// Définition du modèle Incursion
const Incursion = sequelize.define('Incursion', {
    /**
     * Clé primaire UUID auto-générée pour chaque incursion
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Identifiant unique de l\'incursion'
    },
    /**
     * Identifiant unique de l'annonce (Discord button customId)
     */
    customId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Identifiant custom pour interactions'
    },

    /**
     * ID Discord de l'utilisateur ayant créé l'incursion
     */
    creatorId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID Discord du créateur'
    },

    /**
     * Date et heure de lancement de l'incursion
     */
    launchDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date/heure de lancement'
    },

    /**
     * Zone où se déroule l'incursion (nom de la mission)
     */
    zone: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nom de la zone ou mission'
    },

    /**
     * ID du thread (si posté dans un forum Discord)
     */
    threadId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID thread Discord (forum)'
    },

    /**
     * ID du message contenant l'embed de l'incursion
     */
    messageId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID message pour mise à jour'
    },

    /**
     * Indicateur si la notification 15min a été envoyée
     */
    isNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Notification déjà envoyée'
    },

    /**
     * Clé étrangère vers le serveur Discord
     */
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Server, key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        comment: 'Référence au serveur (FK)'
    }
}, {
    tableName: 'incursions',
    timestamps: true,
    comment: 'Table des incursions (4 joueurs, DPS/Heal/Tank)'
});

module.exports = Incursion;