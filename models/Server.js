const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const User = require('./User');

/**
 * 🛡️ Serveur Discord enregistré sur la plateforme.
 * Chaque serveur appartient à un utilisateur créateur.
 *
 * @model Server
 * @property {string} name - Nom du serveur
 * @property {string} discordId - ID Discord du serveur (unique)
 * @property {string} [icon] - URL de l’icône du serveur
 * @property {number} createdBy - ID interne de l’utilisateur créateur
 * @property {boolean} td2Enabled - Le module "The Division 2" est-il activé ?
 * @association belongsTo User
 * @timestamps createdAt, updatedAt
 */
const Server = sequelize.define('Server', {
    id: {
        type: DataTypes.INTEGER, // ✅ auto_increment ID SQL
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discordId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',   // ou User.tableName
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    td2Enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['createdBy'] }
    ]
});

module.exports = Server;
