const axios = require('axios');

// URL de ton bot qui écoute les webhooks
const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || 'http://localhost:3001/webhook/sanction';
const BOT_SECRET = process.env.BOT_SECRET || 'supersecrettoken'; // optionnel si tu as un middleware de sécurité

/**
 * Envoie un événement webhook vers le bot Discord
 *
 * @param {'create' | 'update' | 'delete'} action - Type d'action sur la sanction
 * @param {Object} sanction - Détail de la sanction
 */
async function sendWebhookToBot(action, sanction) {
    try {
        await axios.post(BOT_WEBHOOK_URL, {
            action,
            sanction
        }, {
            headers: {
                'Authorization': `Bearer ${BOT_SECRET}`, // Si ton bot utilise une vérification de token
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Webhook envoyé: ${action} pour sanction ${sanction.id}`);
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi du webhook:`, error.message);
    }
}

module.exports = { sendWebhookToBot };
