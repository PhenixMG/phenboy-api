const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const {getAllTd2Activities, createTd2Activity, updateTd2Activity, deleteTd2Activity,
    getAllBlacklist, addBlacklist, deleteBlacklist
} = require("../controllers/theDivisionController");

// Routes Activité The Division 2
router.get('/:guildId/activities', isAuthenticated, isAdmin, getAllTd2Activities);
router.post('/:guildId/activity/create', isAuthenticated, isAdmin, createTd2Activity); // création d'une activité TD2
router.patch('/:activityId/activity/update', isAuthenticated, isAdmin, updateTd2Activity); // mise à jour d'une activité TD2
router.delete('/:activityId/activity/delete', isAuthenticated, isAdmin, deleteTd2Activity); // suppression d'une activité TD2

// Routes Blacklist The Division 2
router.get('/:guildId/blacklist', isAuthenticated, isAdmin, getAllBlacklist);
router.post('/:guildId/blacklist/add', isAuthenticated, isAdmin, addBlacklist); // Ajout d'un blacklist TD2
router.delete('/:userId/blacklist/delete', isAuthenticated, isAdmin, deleteBlacklist); // suppression d'un blacklist TD2

module.exports = router;