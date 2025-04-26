const express = require('express');
const router = express.Router();
const { getProfile } = require('../controllers/userController');
const isAuthenticated = require('../middlewares/isAuthenticated');

// Renvoie les infos du user connecté
router.get('/me', isAuthenticated, getProfile);

module.exports = router;