// --------------------------------------------------------
// 🧩 Configuration unique des salons Discord pour un serveur.
// Permet de définir dynamiquement les salons de logs, d'accueil, d'annonces
// et les salons spécifiques au module The Division 2.
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server'); // Modèle Server pour la clé étrangère

// Définition du modèle ServerChannelConfig
const ServerChannelConfig = sequelize.define('ServerChannelConfig', {
    /**
     * Domaine fonctionnel de la configuration
     * - 'core'    : périmètre global (logs, annonces, welcome, etc.)
     * - 'division': spécifique au module The Division 2
     */
    scope: {
        type: DataTypes.ENUM('core', 'division'),
        allowNull: false,
        comment: 'Domaine fonctionnel: core ou division'
    },

    /**
     * Type de configuration
     * Valeurs possibles selon le scope :
     * - core    : 'log', 'bienvenue', 'au-revoir', 'annonces'
     * - division: 'raid', 'incursion', 'activite', 'blacklist'
     */
    type: {
        type: DataTypes.ENUM(
            'log',        // Salon de logs généraux
            'bienvenue',  // Salon d'accueil des nouveaux membres
            'au-revoir',  // Salon d'adieux
            'annonces',   // Salon d'annonces globales
            'raid',       // Salon dédié aux raids (division)
            'incursion',  // Salon pour les incursions (division)
            'activite',   // Salon d'activités (division)
            'blacklist'   // Salon de gestion de blacklist (division)
        ),
        allowNull: false,
        comment: 'Type de config: log, bienvenue, annonces, raid, etc.'
    },

    /**
     * ID Discord du salon configuré
     */
    channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID du channel Discord',
        // (Optionnel) Valider que c'est un snowflake numérique
        // validate: { is: /^[0-9]+$/ }
    },

    /**
     * Clé étrangère vers le serveur Discord
     * Assure la relation et la suppression en cascade
     */
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Server,    // Table SQL 'Servers'
            key: 'id'
        },
        onDelete: 'CASCADE',  // Supprime la config si le serveur est supprimé
        onUpdate: 'CASCADE',  // Met à jour en cascade si l'ID du serveur change
        comment: 'Référence au serveur (FK)'
    }
}, {
    // ----------------------------------------------------
    // Options du modèle
    // ----------------------------------------------------

    tableName: 'server_channel_configs',
    timestamps: true,        // Ajoute createdAt et updatedAt automatiquement
    comment: 'Table de configurations de channels par serveur',

    // Index pour accélérer les requêtes fréquentes
    indexes: [
        { fields: ['serverId'] },          // Recherche par serveur
        { fields: ['scope', 'type'] }      // Recherche par domaine et type
    ],

    // Contrainte unique pour éviter les doublons de config
    uniqueKeys: {
        unique_config: {
            fields: ['serverId', 'scope', 'type']
        }
    }
});

// Export du modèle pour utilisation dans l'application
module.exports = ServerChannelConfig;
