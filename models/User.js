const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // important pour éviter les doublons
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'mods', 'admin'), // on peut rajouter d'autres rôles plus tard
        allowNull: false,
        defaultValue: 'user'
    }
});

module.exports = User;
