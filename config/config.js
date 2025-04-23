require('dotenv').config();

const baseConfig = require('./config.json');

module.exports = {
    development: baseConfig.development,
    production: baseConfig.production,

    // 🎯 Environnement de test → SQLite en mémoire (rapide et isolé)
    test: {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    }
};
