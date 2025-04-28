// --------------------------------------------------------
// ⚖️ Log d'une action de modération effectuée sur un serveur Discord.
// Sert à tracer et historiser toutes les actions administratives
// en lien avec un serveur, un modérateur, et un utilisateur ciblé.
// --------------------------------------------------------

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server'); // Pour la clé étrangère vers Server

// Définition du modèle ModerationLog
const ModerationLog = sequelize.define('ModerationLog', {
    /**
     * Clé primaire UUID auto-générée pour chaque log
     */
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    /**
     * Clé étrangère vers le serveur Discord où l'action a eu lieu
     */
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Server,   // Table SQL 'Servers'
            key: 'id'
        },
        onDelete: 'CASCADE',  // Supprime le log si le serveur est supprimé
        onUpdate: 'CASCADE',  // Met à jour si l'ID du serveur change
        comment: 'Référence au serveur (FK)'
    },

    /**
     * ID Discord de l'utilisateur ciblé par l'action
     */
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "ID Discord de l'utilisateur ciblé"
    },

    /**
     * ID Discord du modérateur ayant effectué l'action
     */
    modId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "ID Discord du modérateur"
    },

    /**
     * Type d'action de modération
     * - 'mute'  : mise en sourdine
     * - 'warn'  : avertissement
     * - 'ban'   : bannissement
     * - 'kick'  : expulsion
     */
    action: {
        type: DataTypes.ENUM('mute', 'warn', 'ban', 'kick'),
        allowNull: false,
        comment: 'Type d\'action de modération'
    },

    /**
     * Motif de l'action (facultatif)
     */
    reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison facultative de l\'action'
    },

    /**
     * Horodatage de l'action (par défaut NOW)
     */
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date et heure de l\'action'
    },

    /**
     * Durée de l'action en secondes (ex: durée du mute)
     * null = action permanente (ban)
     */
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Durée en secondes, null si permanent'
    }
}, {
    // ----------------------------------------------------
    // Options du modèle
    // ----------------------------------------------------
    tableName: 'moderation_logs',
    timestamps: true,          // Adds createdAt and updatedAt
    comment: 'Logs de modération par serveur Discord',

    // Index pour optimiser les recherches fréquentes
    indexes: [
        { fields: ['serverId'] },
        { fields: ['userId'] },
        { fields: ['modId'] },
        { fields: ['action'] },
        { fields: ['timestamp'] }
    ]
});

// Export du modèle pour utilisation dans l'application
module.exports = ModerationLog;
