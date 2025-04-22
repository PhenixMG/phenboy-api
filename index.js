const express = require('express');
const app = express();
const { sequelize } = require('./db/database');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { authMiddleware, authorizeRoles } = require('./middlewares/authMiddleware');
const initModels = require("./models/initModels");
const cors = require('cors');
const cookieParser = require("cookie-parser");

require('dotenv').config();
app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173', // Front Vite
    credentials: true
}));

// Initialiser les modèles
initModels();

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
sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
});

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
