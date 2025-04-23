const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * @swagger
 * 📁 Catégories de forum.
 * Chaque catégorie peut contenir plusieurs threads.
 *
 * @model Category
 * @property {string} name - Nom unique de la catégorie
 * @property {string} [description] - Description facultative
 * @timestamps createdAt, updatedAt
 */
const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // ⚠️ Un seul nom par catégorie
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Category;
