require('dotenv').config();

module.exports = {
    development: require('./config.json').development,
    production: require('./config.json').production,
    test: {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
    }
};
