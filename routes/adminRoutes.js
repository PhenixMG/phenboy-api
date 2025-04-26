const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const {getAllUsers} = require("../controllers/adminController");

// Route admin pour voir tous les utilisateurs
router.get('/users', isAuthenticated, isAdmin, getAllUsers);
router.get('/dashboard', isAuthenticated, isAdmin)

module.exports = router;