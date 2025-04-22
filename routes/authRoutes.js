const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/discord/callback', authController.discordCallback);

module.exports = router;
