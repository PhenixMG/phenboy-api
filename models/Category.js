const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true // createdAt, updatedAt
});

module.exports = Category;
