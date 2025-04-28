const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const Td2Raid = sequelize.define('Td2Raid', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    zone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dps: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [] // Liste vide au départ
    },
    heal: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    tank: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    unavailable: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    late: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    substitutes: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    threadId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    messageId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    serverDiscordId: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Td2Raid;