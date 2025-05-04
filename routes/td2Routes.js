// routes/td2.js
// --------------------------------------------------------
// 🔗 Routes pour le module "The Division 2" (TD2) :
// gestion des Raids, Activités et Incursions ainsi que leurs participants.
// Toutes les routes sont préfixées par '/td2/'.
// Middlewares : isAuthenticated, isAdmin.
// --------------------------------------------------------

const express = require('express');
const router = express.Router();

// Middlewares d'authentification et d'autorisation
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin          = require('../middlewares/isAdmin');

// Controllers TD2
const {
    // Raids
    createRaid,
    getAllRaids,
    getRaidById,
    updateRaid,
    deleteRaid,
    removeRaidParticipant,
    updateRaidParticipant,
    addRaidParticipant,
    getRaidParticipants,
    // Activities
    createActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
    getActivityByMessageId,
    deleteActivityByMessageId,
    getActivityParticipants,
    addActivityParticipant,
    removeActivityParticipant,
    // Incursions
    createIncursion,
    getAllIncursions,
    getIncursionById,
    updateIncursion,
    deleteIncursion,
    getIncursionParticipants,
    addIncursionParticipant,
    updateIncursionParticipant,
    removeIncursionParticipant,
    // Ubisoft
    getUbisoftProfile,
    upsertProfile,
    // Reminders
    scheduleReminders,
    getAllReminders,
    deleteReminder, getRaidByMessageId
} = require('../controllers/td2Controller');

// ------------------------------------------------------------------
// 🔹 Raids
// ------------------------------------------------------------------

// GET /td2/raids
// Récupère la liste de tous les raids (filtrage optionnel par serverId dans req.query)
router.get(
    '/raids',
    isAuthenticated,
    getAllRaids
);

// GET /td2/raids/:id
// Récupère un raid spécifique par son ID
router.get(
    '/raids/:id',
    isAuthenticated,
    getRaidById
);

// GET /td2/raids/message/:messageId
// Récupère un raid spécifique par son messageId
router.get(
    '/raids/message/:messageId',
    isAuthenticated,
    getRaidByMessageId
)

// POST /td2/raids
// Crée un nouveau raid (seulement pour les admins)
router.post(
    '/raids',
    isAuthenticated,
    createRaid
);

// PATCH /td2/raids/:id
// Met à jour un raid existant par son ID (admin uniquement)
router.patch(
    '/raids/:id',
    isAuthenticated,
    updateRaid
);

// DELETE /td2/raids/:id
// Supprime un raid par son ID (admin uniquement)
router.delete(
    '/raids/:id',
    isAuthenticated,
    deleteRaid
);

// ------------------------------------------------------------------
// 🔹 Participants de RAID
// ------------------------------------------------------------------

// GET /td2/raids/:raidId/participants
// Récupère tous les participants d’un raid spécifié par raidId
router.get(
    '/raid/:raidId/participants',
    isAuthenticated,
    getRaidParticipants
);

// POST /td2/raids/:raidId/participants
// Ajoute un participant à un raid (statut et role dans req.body)
router.post(
    '/raid/:raidId/participants',
    isAuthenticated,
    addRaidParticipant
);

// PATCH /td2/raid/participants/:id
// Met à jour le rôle ou le statut d’un participant existant (par participant ID)
router.patch(
    '/raid/participants/:id',
    isAuthenticated,
    updateRaidParticipant
);

// DELETE /td2/participants/:id
// Retire un participant d’un raid (par participant ID)
router.delete(
    '/raid/participants/:id',
    isAuthenticated,
    removeRaidParticipant
);

// ------------------------------------------------------------------
// 🔹 Activités
// ------------------------------------------------------------------

// GET /td2/activities
// Récupère la liste de toutes les activités (filtrage optionnel par serverId)
router.get(
    '/activities',
    isAuthenticated,
    getAllActivities
);

// GET /td2/activities/:id
// Récupère une activité par son ID
router.get(
    '/activities/:id',
    isAuthenticated,
    getActivityById
);

// GET /td2/activities/message/:id
// Récupère une activité par son messageId
router.get(
    '/activities/message/:id',
    isAuthenticated,
    getActivityByMessageId
);

// POST /td2/activities
// Crée une nouvelle activité (admin uniquement)
router.post(
    '/activities',
    isAuthenticated,
    createActivity
);

// PATCH /td2/activities/:id
// Met à jour une activité existante (admin uniquement)
router.patch(
    '/activities/:id',
    isAuthenticated,
    updateActivity
);

// DELETE /td2/activities/:id
// Supprime une activité (admin uniquement)
router.delete(
    '/activities/:id',
    isAuthenticated,
    deleteActivity
);

// DELETE /td2/activities/:id
// Supprime une activité (admin uniquement)
router.delete(
    '/activities/message/:id',
    isAuthenticated,
    isAdmin,
    deleteActivityByMessageId
);

// ------------------------------------------------------------------
// 🔹 Participants d'ACTIVITÉ
// ------------------------------------------------------------------

// GET /td2/activities/:activityId/participants
// Récupère tous les participants d’une activité spécifiée
router.get(
    '/activities/:activityId/participants',
    isAuthenticated,
    getActivityParticipants
);

// POST /td2/activities/:activityId/participants
// Ajoute un participant à une activité
router.post(
    '/activities/:activityId/participants',
    isAuthenticated,
    addActivityParticipant
);

// DELETE /td2/activities/participants/:id
// Retire un participant d’une activité (par participant ID)
router.delete(
    '/activities/participants/:id',
    isAuthenticated,
    removeActivityParticipant
);

// ------------------------------------------------------------------
// 🔹 Incursions
// ------------------------------------------------------------------

// GET /td2/incursions
// Récupère la liste de toutes les incursions (filtrage optionnel par serverId)
router.get(
    '/incursions',
    isAuthenticated,
    getAllIncursions
);

// GET /td2/incursions/:id
// Récupère une incursion par son ID
router.get(
    '/incursions/:id',
    isAuthenticated,
    getIncursionById
);

// POST /td2/incursions
// Crée une nouvelle incursion (admin uniquement)
router.post(
    '/incursions',
    isAuthenticated,
    createIncursion
);

// PATCH /td2/incursions/:id
// Met à jour une incursion existante (admin uniquement)
router.patch(
    '/incursions/:id',
    isAuthenticated,
    updateIncursion
);

// DELETE /td2/incursions/:id
// Supprime une incursion (admin uniquement)
router.delete(
    '/incursions/:id',
    isAuthenticated,
    deleteIncursion
);

// ------------------------------------------------------------------
// 🔹 Participants d'INCURSION
// ------------------------------------------------------------------

// GET /td2/incursions/:incursionId/participants
// Récupère tous les participants d’une incursion
router.get(
    '/incursions/:incursionId/participants',
    isAuthenticated,
    getIncursionParticipants
);

// POST /td2/incursions/:incursionId/participants
// Ajoute un participant à une incursion
router.post(
    '/incursions/:incursionId/participants',
    isAuthenticated,
    addIncursionParticipant
);

// PATCH /td2/incursions/participants/:id
// Met à jour un participant d’incursion (role, status)
router.patch(
    '/incursions/participants/:id',
    isAuthenticated,
    updateIncursionParticipant
);

// DELETE /td2/incursions/participants/:id
// Retire un participant d’incursion (par participant ID)
router.delete(
    '/incursions/participants/:id',
    isAuthenticated,
    removeIncursionParticipant
);

// ------------------------------------------------------------------
// 🔹 Profile Ubisoft
// ------------------------------------------------------------------

// GET /td2/ubisoft/:discordId
// Récupère un profil Ubisoft
router.get('/ubisoft/:discordId', getUbisoftProfile)

// POST /td2/ubisoft/:discordId
//Ajoute un profil Ubisoft
router.post('/ubisoft/:discordId', upsertProfile)

router.get('/reminders', isAuthenticated, getAllReminders)

router.post(
    '/reminders/create',
    isAuthenticated,
    scheduleReminders
);

router.delete('/reminders/:reminderId', isAuthenticated, deleteReminder)

module.exports = router;
