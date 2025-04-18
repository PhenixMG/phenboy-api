const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

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

User.hasMany(RefreshToken);
RefreshToken.belongsTo(User);

module.exports = RefreshToken;
