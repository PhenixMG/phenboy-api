const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const Thread = sequelize.define('Thread', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Thread;
