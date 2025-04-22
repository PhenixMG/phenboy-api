const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: true // le titre n'est pas obligatoire pour les réponses
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Post;
