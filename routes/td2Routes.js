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
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const { isAdmin }         = require('../middlewares/isAdmin');

// Controllers TD2
const {
    // Raids
    createRaid,
    getAllRaids,
    getRaidById,
    updateRaid,
    deleteRaid,
    getParticipants,
    addParticipant,
    updateParticipant,
    removeParticipant,
    // Activities
    createActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
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
    removeIncursionParticipant
} = require('../controllers/td2Controller');

// ------------------------------------------------------------------
// 🔹 Raids
// ------------------------------------------------------------------

// GET /td2/raids
// Récupère la liste de tous les raids (filtrage optionnel par serverId dans req.query)
router.get(
    '/td2/raids',
    isAuthenticated,
    getAllRaids
);

// GET /td2/raids/:id
// Récupère un raid spécifique par son ID
router.get(
    '/td2/raids/:id',
    isAuthenticated,
    getRaidById
);

// POST /td2/raids
// Crée un nouveau raid (seulement pour les admins)
router.post(
    '/td2/raids',
    isAuthenticated,
    isAdmin,
    createRaid
);

// PATCH /td2/raids/:id
// Met à jour un raid existant par son ID (admin uniquement)
router.patch(
    '/td2/raids/:id',
    isAuthenticated,
    isAdmin,
    updateRaid
);

// DELETE /td2/raids/:id
// Supprime un raid par son ID (admin uniquement)
router.delete(
    '/td2/raids/:id',
    isAuthenticated,
    isAdmin,
    deleteRaid
);

// ------------------------------------------------------------------
// 🔹 Participants de RAID
// ------------------------------------------------------------------

// GET /td2/raids/:raidId/participants
// Récupère tous les participants d’un raid spécifié par raidId
router.get(
    '/td2/raids/:raidId/participants',
    isAuthenticated,
    getParticipants
);

// POST /td2/raids/:raidId/participants
// Ajoute un participant à un raid (statut et role dans req.body)
router.post(
    '/td2/raids/:raidId/participants',
    isAuthenticated,
    addParticipant
);

// PATCH /td2/participants/:id
// Met à jour le rôle ou le statut d’un participant existant (par participant ID)
router.patch(
    '/td2/participants/:id',
    isAuthenticated,
    updateParticipant
);

// DELETE /td2/participants/:id
// Retire un participant d’un raid (par participant ID)
router.delete(
    '/td2/participants/:id',
    isAuthenticated,
    removeParticipant
);

// ------------------------------------------------------------------
// 🔹 Activités
// ------------------------------------------------------------------

// GET /td2/activities
// Récupère la liste de toutes les activités (filtrage optionnel par serverId)
router.get(
    '/td2/activities',
    isAuthenticated,
    getAllActivities
);

// GET /td2/activities/:id
// Récupère une activité par son ID
router.get(
    '/td2/activities/:id',
    isAuthenticated,
    getActivityById
);

// POST /td2/activities
// Crée une nouvelle activité (admin uniquement)
router.post(
    '/td2/activities',
    isAuthenticated,
    isAdmin,
    createActivity
);

// PATCH /td2/activities/:id
// Met à jour une activité existante (admin uniquement)
router.patch(
    '/td2/activities/:id',
    isAuthenticated,
    isAdmin,
    updateActivity
);

// DELETE /td2/activities/:id
// Supprime une activité (admin uniquement)
router.delete(
    '/td2/activities/:id',
    isAuthenticated,
    isAdmin,
    deleteActivity
);

// ------------------------------------------------------------------
// 🔹 Participants d'ACTIVITÉ
// ------------------------------------------------------------------

// GET /td2/activities/:activityId/participants
// Récupère tous les participants d’une activité spécifiée
router.get(
    '/td2/activities/:activityId/participants',
    isAuthenticated,
    getActivityParticipants
);

// POST /td2/activities/:activityId/participants
// Ajoute un participant à une activité
router.post(
    '/td2/activities/:activityId/participants',
    isAuthenticated,
    addActivityParticipant
);

// DELETE /td2/activities/participants/:id
// Retire un participant d’une activité (par participant ID)
router.delete(
    '/td2/activities/participants/:id',
    isAuthenticated,
    removeActivityParticipant
);

// ------------------------------------------------------------------
// 🔹 Incursions
// ------------------------------------------------------------------

// GET /td2/incursions
// Récupère la liste de toutes les incursions (filtrage optionnel par serverId)
router.get(
    '/td2/incursions',
    isAuthenticated,
    getAllIncursions
);

// GET /td2/incursions/:id
// Récupère une incursion par son ID
router.get(
    '/td2/incursions/:id',
    isAuthenticated,
    getIncursionById
);

// POST /td2/incursions
// Crée une nouvelle incursion (admin uniquement)
router.post(
    '/td2/incursions',
    isAuthenticated,
    isAdmin,
    createIncursion
);

// PATCH /td2/incursions/:id
// Met à jour une incursion existante (admin uniquement)
router.patch(
    '/td2/incursions/:id',
    isAuthenticated,
    isAdmin,
    updateIncursion
);

// DELETE /td2/incursions/:id
// Supprime une incursion (admin uniquement)
router.delete(
    '/td2/incursions/:id',
    isAuthenticated,
    isAdmin,
    deleteIncursion
);

// ------------------------------------------------------------------
// 🔹 Participants d'INCURSION
// ------------------------------------------------------------------

// GET /td2/incursions/:incursionId/participants
// Récupère tous les participants d’une incursion
router.get(
    '/td2/incursions/:incursionId/participants',
    isAuthenticated,
    getIncursionParticipants
);

// POST /td2/incursions/:incursionId/participants
// Ajoute un participant à une incursion
router.post(
    '/td2/incursions/:incursionId/participants',
    isAuthenticated,
    addIncursionParticipant
);

// PATCH /td2/incursions/participants/:id
// Met à jour un participant d’incursion (role, status)
router.patch(
    '/td2/incursions/participants/:id',
    isAuthenticated,
    updateIncursionParticipant
);

// DELETE /td2/incursions/participants/:id
// Retire un participant d’incursion (par participant ID)
router.delete(
    '/td2/incursions/participants/:id',
    isAuthenticated,
    removeIncursionParticipant
);

module.exports = router;
