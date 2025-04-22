const { sequelize } = require('../db/database');
const initModels = require('../models/initModels');

async function resetDatabase() {
    try {
        console.log('🔄 Initialisation des modèles...');
        initModels();

        console.log('🗑 Suppression et recréation des tables...');
        await sequelize.sync({ force: true });

        console.log('✅ Base de données réinitialisée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation de la base de données :', error);
        process.exit(1);
    }
}

resetDatabase();
