const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const ScheduledReminder = sequelize.define('ScheduledReminder', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    eventType: {
        type: DataTypes.ENUM('activité','raid','incursion'),
        allowNull: false,
        comment: 'Type d’élément pour lequel on rappelle'
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'ID de l’événement (activity.id, raid.id, etc.)'
    },
    remindAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Quand envoyer le rappel'
    },
    remindKind: {
        type: DataTypes.ENUM('15min','5min', 'delete'),
        allowNull: false,
        comment: '–15 min ou –5 min ou suppression'
    }
}, {
    tableName: 'scheduled_reminders',
    timestamps: false
});

module.exports = ScheduledReminder;