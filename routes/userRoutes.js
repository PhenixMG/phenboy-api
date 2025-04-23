const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @route GET /users
 * @desc Récupère tous les utilisateurs (admin-only ?)
 * @access Public / à sécuriser ?
 */
router.get('/', userController.getAllUsers);

module.exports = router;
