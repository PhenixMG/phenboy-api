const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { addServer, getUserServers, toggleTD2Module, getUserGuilds} = require("../controllers/serverController");

const router = express.Router();

/**
 * @route POST /servers
 * @desc Ajoute un serveur Discord à l'utilisateur connecté
 * @access Authenticated
 */
router.post('/', authMiddleware, addServer);

/**
 * @route GET /servers
 * @desc Liste les serveurs créés par l'utilisateur connecté
 * @access Authenticated
 */
router.get('/configuredservers', authMiddleware, getUserServers);

/**
 * @route PATCH /servers/:id/modules/td2
 * @desc Active/désactive le module "The Division 2" pour ce serveur
 * @access Authenticated
 */
router.patch('/server/:id/modules/td2', authMiddleware, toggleTD2Module);

router.get('/serversconfig', authMiddleware, getUserGuilds)

module.exports = router;
