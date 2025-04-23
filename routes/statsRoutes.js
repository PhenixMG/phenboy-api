const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getMemberStats, addSnapshot, getLatestSnapshot } = require('../controllers/statsController');

const router = express.Router();

/**
 * @route GET /admin/servers/:id/stats/members
 * @desc Retourne tous les snapshots journaliers des membres du serveur
 * @access Authenticated
 */
router.get('/admin/servers/:id/stats/members', authMiddleware, getMemberStats);

/**
 * @route POST /admin/servers/:id/stats/members
 * @desc Ajoute un snapshot journalier (utilisé par cron)
 * @access Authenticated
 */
router.post('/admin/servers/:id/stats/members', authMiddleware, addSnapshot);

/**
 * @route GET /admin/servers/:id/stats/members/latest
 * @desc Récupère le dernier snapshot journalier
 * @access Authenticated
 */
router.get('/admin/servers/:id/stats/members/latest', authMiddleware, getLatestSnapshot);

module.exports = router;
