const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getServerChannels, setServerChannel } = require('../controllers/adminController');

const router = express.Router();

/**
 * @route GET /admin/servers/:id/channels
 * @desc Récupère la configuration des salons système (log, welcome, etc.)
 * @access Authenticated
 */
router.get('/servers/:id/channels', authMiddleware, getServerChannels);

/**
 * @route POST /admin/servers/:id/channels
 * @desc Définit ou supprime un salon système (si channelId = null)
 * @access Authenticated
 */
router.post('/servers/:id/channels', authMiddleware, setServerChannel);

module.exports = router;
