const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const RefreshToken = sequelize.define('RefreshToken', {
    token: { // ici on stocke l'ID du JWT (pas tout le token)
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
});


module.exports = RefreshToken;
