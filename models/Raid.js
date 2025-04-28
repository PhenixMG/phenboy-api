// --------------------------------------------------------
// Ce modèle représente un raid planifié sur un serveur Discord.
// Un raid possède des informations générales, une date de lancement,
// et est lié à un serveur (Server).
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

// Définition du modèle Raid
const Raid = sequelize.define('Raid', {
    // Clé primaire : identifiant unique en UUID v4
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Génère automatiquement un UUID v4
        primaryKey: true,
    },

    // ID Discord (ou autre) de l'utilisateur qui a créé l'annonce du raid
    announcementCreatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // Nom du raid (ex : "Temple noir", "Karazhan", etc.)
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // Date et heure de lancement du raid
    launchDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    // ID Discord (ou autre) du créateur “métier” du raid
    raidCreatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // Zone où se déroule le raid (ex : donjon, raid)
    zone: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // ID du thread si le raid est posté dans un forum (nullable)
    threadId: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // ID du message si le raid est posté dans un salon classique (nullable)
    messageId: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // Indicateur si le raid est actif ou clôturé
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Par défaut, un raid est actif
    },

    // Clé étrangère vers le serveur Discord auquel appartient le raid
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Servers', // Nom de la table SQL associée au modèle Server
            key: 'id'
        },
        onDelete: 'CASCADE',  // Supprime le raid si le serveur est supprimé
        onUpdate: 'CASCADE'   // Met à jour en cascade si l'ID du serveur change
    }
}, {
    // Options du modèle
    tableName: 'raids',   // Nom explicite de la table en base
    timestamps: true,     // Ajoute createdAt et updatedAt

    // Hooks Sequelize pour gérer le rappel de notification
    hooks: {
        // Après création d'un raid, planifier le rappel automatique
        afterCreate: raid => raid.scheduleReminder(),

        // Après mise à jour, si la launchDate change, replanifier le rappel
        afterUpdate: raid => {
            if (raid.changed('launchDate')) {
                raid.scheduleReminder();
            }
        }
    }
});

// Méthode d’instance pour planifier un rappel 15 minutes avant la date de lancement
Raid.prototype.scheduleReminder = function() {
    // Calcul de l'instant de notification
    const notifyAt = new Date(this.launchDate.getTime() - 15 * 60 * 1000);
    // TODO : Utiliser votre librairie de scheduling (cron, Bull, Agenda, etc.)
    // Exemple : scheduleJob(notifyAt, () => sendReminder(this.id));
};

// Export du modèle pour qu'il soit utilisé dans l'app
module.exports = Raid;
