const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * 🧵 Thread de forum.
 * Chaque thread appartient à une catégorie et contient plusieurs posts.
 *
 * @model Thread
 * @property {string} title - Titre du thread
 * @association belongsTo Category
 * @association hasMany Post
 * @timestamps createdAt, updatedAt
 */
const Thread = sequelize.define('Thread', {
    title: {
        type: DataTypes.STRING,
        allowNull: false // Titre obligatoire pour l’ouverture du sujet
    }
}, {
    timestamps: true
});

module.exports = Thread;
