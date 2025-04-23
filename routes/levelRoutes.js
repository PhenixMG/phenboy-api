const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { getLevels, setUserLevel, resetUserLevel, getTopLevels } = require('../controllers/levelController');

const router = express.Router();

/**
 * @route GET /admin/servers/:id/levels
 * @desc Récupère les niveaux & XP de tous les membres d’un serveur
 * @access Authenticated
 */
router.get('/admin/servers/:id/levels', authMiddleware, getLevels);

/**
 * @route POST /admin/servers/:id/levels
 * @desc Définit le niveau ou l’XP pour un utilisateur
 * @access Authenticated
 */
router.post('/admin/servers/:id/levels', authMiddleware, setUserLevel);

/**
 * @route DELETE /admin/servers/:id/levels/:userId
 * @desc Réinitialise le niveau d’un utilisateur donné
 * @access Authenticated
 */
router.delete('/admin/servers/:id/levels/:userId', authMiddleware, resetUserLevel);

/**
 * @route GET /admin/servers/:id/levels/top
 * @desc Retourne le top 10 des utilisateurs par XP
 * @access Authenticated
 */
router.get('/admin/servers/:id/levels/top', authMiddleware, getTopLevels);

module.exports = router;
