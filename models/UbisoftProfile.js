const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const UbisoftProfile = sequelize.define('UbisoftProfile', {
    discordId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'ID Discord de l’utilisateur'
    },
    ubisoftId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Pseudo Ubisoft de l’utilisateur'
    }
}, {
    tableName: 'user_profiles',
    timestamps: true
})

module.exports = UbisoftProfile;