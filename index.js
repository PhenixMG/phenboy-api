const express = require('express');
const app = express();
const sequelize = require('./db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler'); // <-- ici
const authMiddleware = require('./middlewares/authMiddleware');

require('dotenv').config();

app.use(express.json());

// Relations
const User = require('./models/User');
const Post = require('./models/Post');
const {authorizeRoles} = require("./middlewares/authMiddleware");
User.hasMany(Post);
Post.belongsTo(User);

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);

// Gestion 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Gestion erreurs globales
app.use(errorHandler);

// Lancer serveur
sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
});

const router = express.Router();

// Exemple de route protégée
app.get('/private', authMiddleware, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}` });
});
app.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}`, role: req.user.role });
});
app.post('/admin-only', authMiddleware, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome admin!' });
});
