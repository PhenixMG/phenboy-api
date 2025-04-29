// models/Server.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const User = require('./User');

const Server = sequelize.define('Server', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discordId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { isUrl: true }
    },
    // ← ici on passe en UUID pour matcher User.id
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,       // ou 'Users'
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    td2Enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'Servers',
    timestamps: true,
    indexes: [
        { fields: ['createdBy'] }
    ]
});

module.exports = Server;
