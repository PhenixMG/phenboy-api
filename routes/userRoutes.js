const express = require('express');
const router = express.Router();
const { getProfile, getAllUsers, getUserConfiguredServers, saveGuildConfiguration} = require('../controllers/userController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');

// Renvoie les infos du user connecté
router.get('/me', isAuthenticated, getProfile);
router.get('/servers', isAuthenticated, getUserConfiguredServers);
router.post('/:serverId/config', isAuthenticated, saveGuildConfiguration);

// Route admin pour voir tous les utilisateurs
router.get('/users', isAuthenticated, isAdmin, getAllUsers);

module.exports = router;