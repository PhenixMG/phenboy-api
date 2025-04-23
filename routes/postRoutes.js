const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

/**
 * @route GET /posts
 * @desc Récupère tous les posts (sans filtre)
 * @access Public
 */
router.get('/', postController.getAllPosts);

module.exports = router;
