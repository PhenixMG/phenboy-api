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
        unique: true // important pour éviter les doublons
    },
    role: {
        type: DataTypes.ENUM('user', 'mods', 'admin'), // on peut rajouter d'autres rôles plus tard
        allowNull: false,
        defaultValue: 'user'
    }
});

module.exports = User;
