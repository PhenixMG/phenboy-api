const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
    getModerationLogs,
    addModerationLog,
    getModerationLogsGrouped
} = require('../controllers/moderationController');

const router = express.Router();

/**
 * @route GET /admin/servers/:id/modlogs
 * @desc Récupère tous les logs de modération d’un serveur
 * @access Authenticated
 */
router.get('/admin/servers/:id/modlogs', authMiddleware, getModerationLogs);

/**
 * @route GET /admin/servers/:id/modlogs/grouped
 * @desc Regroupe les logs par utilisateur (mapping {userId: []})
 * @access Authenticated
 */
router.get('/admin/servers/:id/modlogs/grouped', authMiddleware, getModerationLogsGrouped);

/**
 * @route POST /admin/servers/:id/modlogs
 * @desc Ajoute un log d’action modérative
 * @access Authenticated
 */
router.post('/admin/servers/:id/modlogs', authMiddleware, addModerationLog);

module.exports = router;
