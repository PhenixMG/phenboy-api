const express = require('express');
const router = express.Router();
const { getProfile, getAllUsers} = require('../controllers/userController');
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');

// Renvoie les infos du user connecté
router.get('/me', isAuthenticated, getProfile);

// Route admin pour voir tous les utilisateurs
router.get('/users', isAuthenticated, isAdmin, getAllUsers);

module.exports = router;