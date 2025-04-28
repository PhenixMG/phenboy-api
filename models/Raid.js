// models/Raid.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Server = require('./Server');

const Raid = sequelize.define('Raid', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    announcementCreatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    launchDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    raidCreatorId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    zone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    threadId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    serverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Servers',  // table name générée par Sequelize pour le modèle Server
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    tableName: 'raids',
    timestamps: true,
    hooks: {
        afterCreate: raid => raid.scheduleReminder(),
        afterUpdate: raid => {
            if (raid.changed('launchDate')) {
                raid.scheduleReminder();
            }
        }
    }
});

// Méthode d’instance pour planifier le rappel 15 min avant le lancement
Raid.prototype.scheduleReminder = function() {
    const notifyAt = new Date(this.launchDate.getTime() - 15 * 60 * 1000);
    // Ici, scheduleJob(notifyAt, () => sendReminder(this.id))
    // selon la librairie de job que tu utilises (cron, bull, agenda…)
};

module.exports = Raid;
