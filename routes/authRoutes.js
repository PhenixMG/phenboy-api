const express = require('express');
const router = express.Router();
const { login, logout, refreshToken, discordCallback } = require('../controllers/authController');

router.get('/discord/callback', discordCallback);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;