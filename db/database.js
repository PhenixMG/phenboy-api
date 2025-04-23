'use strict';
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const env = process.env.NODE_ENV || 'development';

let config;

/**
 * 🔁 Chargement dynamique de la config :
 * - Priorité au fichier JS (config/config.js) → utile pour les configs dynamiques
 * - Sinon fallback sur le JSON (config/config.json)
 */
if (fs.existsSync(path.join(__dirname, '/../config/config.js'))) {
    config = require(__dirname + '/../config/config.js')[env];
} else {
    config = require(__dirname + '/../config/config.json')[env];
}

const db = {};

let sequelize;

/**
 * 🔗 Initialisation Sequelize en fonction de l’environnement :
 * - Si `use_env_variable` présent → connexion via URL (ex: `DATABASE_URL`)
 * - Si `test` → utilise SQLite / config spéciale
 * - Sinon → connexion classique MySQL
 */
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else if (env === 'test') {
    sequelize = new Sequelize(config); // Mode SQLite ou in-memory
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

console.log(`Connecting with environment: ${env}`);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
