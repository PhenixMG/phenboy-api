const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    const users = await User.findAll();
    res.json(users);
};

exports.getOneUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        res.json(user);
    } catch (err) {
        next(err); // passe l'erreur au middleware
    }
};