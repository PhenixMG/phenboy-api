const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const User = sequelize.define('User', {
    discordId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true // <-- Nouveau champ pour stocker l'avatar Discord
    },
    role: {
        type: DataTypes.ENUM('user', 'mods', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    }
});

module.exports = User;
