const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Thread = require('./Thread');
const User = require('./User');

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

// Relations
Thread.hasMany(Post, { foreignKey: 'threadId', onDelete: 'CASCADE' });
Post.belongsTo(Thread, { foreignKey: 'threadId' });

User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

module.exports = Post;
