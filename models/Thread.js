const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Category = require('./Category');

const Thread = sequelize.define('Thread', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

// Relations
Category.hasMany(Thread, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
Thread.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = Thread;
