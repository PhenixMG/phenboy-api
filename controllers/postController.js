const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
    const posts = await Post.findAll();
    res.json(posts);
};
