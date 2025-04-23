const Post = require('../models/Post');

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Récupère la liste de tous les posts
 *     tags: [Public - Posts]
 *     responses:
 *       200:
 *         description: Liste de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 */
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.json(posts);
    } catch (err) {
        console.error('getAllPosts error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
