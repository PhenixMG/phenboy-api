// services/scheduler.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const {
    Incursion
} = require('../models/Incursion');
const { IncursionParticipant } = require('../models/IncursionParticipant');
const {
    Activity
} = require('../models/Activity');
const { ActivityParticipant } = require('../models/ActivityParticipant');
const { sendWebhookToBot } = require('./webhookService');

// Générique : on boucle sur un modèle et son participant
async function remind(model, ParticipantModel, resourceType) {
    const now = new Date();
    const in15 = new Date(now.getTime() + 15*60*1000);

    const items = await model.findAll({
        where: {
            launchDate: { [Op.between]: [now, in15] },
            isNotified: false
        },
        include: [{ model: ParticipantModel, as: 'participants' }]
    });

    for (const item of items) {
        // Mentionne tous les Confirmed
        const mentions = item.participants
            .filter(p => p.status === 'Confirmed')
            .map(p => `<@${p.userId}>`)
            .join(' ');

        // On envoie un webhook au bot au lieu d'appeler le bot directement
        await sendWebhookToBot(`${resourceType}Reminder`, {
            id:        item.id,
            type:      resourceType,        // 'incursion' ou 'activity'
            mentions,
            threadId:  item.threadId,       // ou messageId si tu préfères
            messageId: item.messageId
        });

        // Marque comme notifié
        item.isNotified = true;
        await item.save();
    }
}

// Toutes les minutes
cron.schedule('* * * * *', async () => {
    try {
        await remind(Incursion, IncursionParticipant, 'incursion');
        await remind(Activity, ActivityParticipant,   'activity');
    } catch (err) {
        console.error('Scheduler error:', err);
    }
});
