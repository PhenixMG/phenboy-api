// models/RaidParticipant.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const Raid = require('./Raid');

const RaidParticipant = sequelize.define('RaidParticipant', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    raidId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'raids',   // nom de la table définie par Raid
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('DPS', 'Heal', 'Tank'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Confirmed', 'Unavailable', 'Late', 'Substitute'),
        allowNull: false,
        defaultValue: 'Confirmed',
    }
}, {
    tableName: 'raid_participants',
    timestamps: true,
    indexes: [
        {
            name: 'raid_status_idx',
            fields: ['raidId', 'status']
        }
    ]
});

module.exports = RaidParticipant;
