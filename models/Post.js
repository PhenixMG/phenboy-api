const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');

/**
 * 🗨️ Post dans un thread de forum.
 * Peut être un message initial (avec titre) ou une réponse (sans titre).
 *
 * @model Post
 * @property {string} [title] - Titre du post (obligatoire uniquement pour les threads initiaux)
 * @property {string} content - Contenu du message
 * @association belongsTo User, Thread
 * @timestamps createdAt, updatedAt
 */
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: true // Facultatif pour les réponses
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Post;
