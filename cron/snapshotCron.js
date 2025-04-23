const cron = require('node-cron');
const MemberSnapshot = require('../models/MemberSnapshot');
const Server = require('../models/Server');
const { sequelize } = require('../db/database');

/**
 * 📅 Tâche CRON : Sauvegarde un snapshot du nombre de membres pour chaque serveur chaque jour à minuit.
 *
 * @cron 0 0 * * * (tous les jours à 00:00)
 * @description Ce cron devrait appeler une API ou bot pour avoir le vrai nombre de membres.
 * Actuellement il simule une valeur aléatoire pour dev.
 */
cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily member snapshot job...');

    try {
        const servers = await Server.findAll();

        for (const server of servers) {
            // ⚠️ À remplacer par un vrai appel bot ou cache
            const fakeCount = Math.floor(Math.random() * 100) + 20;
            const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

            await MemberSnapshot.upsert(
                {
                    serverId: server.id,
                    date: today,
                    count: fakeCount
                },
                {
                    conflictFields: ['serverId', 'date']
                }
            );

            console.log(`→ Snapshot saved for ${server.name} (${server.discordId})`);
        }
    } catch (err) {
        console.error('[CRON ERROR]', err);
    }
});
