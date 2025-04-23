const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    getDivisionChannels,
    setDivisionChannel,
    getBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    getActivities
} = require('../controllers/divisionController');

const router = express.Router();

/**
 * @route GET /admin/servers/:id/division/channels
 * @desc Récupère la config des salons spécifiques à The Division 2
 */
router.get('/admin/servers/:id/division/channels', authMiddleware, getDivisionChannels);

/**
 * @route POST /admin/servers/:id/division/channels
 * @desc Définit un salon (ou le supprime si `channelId = null`)
 */
router.post('/admin/servers/:id/division/channels', authMiddleware, setDivisionChannel);

/**
 * @route GET /admin/servers/:id/division/blacklist
 * @desc Récupère la liste des utilisateurs blacklistés
 */
router.get('/admin/servers/:id/division/blacklist', authMiddleware, getBlacklist);

/**
 * @route POST /admin/servers/:id/division/blacklist
 * @desc Ajoute un utilisateur à la blacklist
 */
router.post('/admin/servers/:id/division/blacklist', authMiddleware, addToBlacklist);

/**
 * @route DELETE /admin/servers/:id/division/blacklist/:userId
 * @desc Supprime un utilisateur de la blacklist
 */
router.delete('/admin/servers/:id/division/blacklist/:userId', authMiddleware, removeFromBlacklist);

/**
 * @route GET /admin/servers/:id/division/activities
 * @desc Récupère la liste des activités TD2 planifiées
 */
router.get('/admin/servers/:id/division/activities', authMiddleware, getActivities);

module.exports = router;
