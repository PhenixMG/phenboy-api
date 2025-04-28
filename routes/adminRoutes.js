const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const {
    getAllUsers,
    createSanction,
    updateSanction,
    deleteSanction, getSanctions
} = require("../controllers/adminController");

// Voir tous les utilisateurs
router.get('/users', isAuthenticated, isAdmin, getAllUsers);

// Voir des stats pour le dashboard admin
// router.get('/dashboard', isAuthenticated, isAdmin, getDashboardStats);

// Gérer les sanctions
router.get('/sanctions/:discordId', isAuthenticated, isAdmin, getSanctions)
router.post('/sanction/create', isAuthenticated, isAdmin, createSanction);     // création d'une sanction
router.patch('/sanctions/:id/update', isAuthenticated, isAdmin, updateSanction); // mise à jour d'une sanction
router.delete('/sanctions/:id/delete', isAuthenticated, isAdmin, deleteSanction); // suppression d'une sanction

module.exports = router;
