const express = require('express');
const app = express();
const { sequelize } = require('./db/database');
const setupSwagger = require('./docs/swagger');

// 📦 Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const levelRoutes = require('./routes/levelRoutes');
const statsRoutes = require('./routes/statsRoutes');
const divisionRoutes = require('./routes/divisionRoutes');

// 🔐 Middlewares
const errorHandler = require('./middlewares/errorHandler');
const { authMiddleware, authorizeRoles } = require('./middlewares/authMiddleware');

// 🧬 Models & Relations
const initModels = require('./models/initModels');

// 🌐 Middleware externes
const cors = require('cors');
const cookieParser = require("cookie-parser");

require('dotenv').config();

// JSON Parser + Cookie parser
app.use(express.json());
app.use(cookieParser());

// CORS : autorise le front local (Vue.js @ localhost:5173)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// 📄 Initialise toutes les associations Sequelize
initModels();

// 📁 Déclaration des routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);

// 🛠 Administration
app.use('/admin', adminRoutes);        // /channels
app.use('/admin', levelRoutes);        // /levels
app.use('/admin', statsRoutes);        // /stats
app.use('/admin', moderationRoutes);   // /modlogs

// 🎮 The Division 2 Module
app.use('/division', divisionRoutes);

// 🛡 Routes protégées de test
app.get('/private', authMiddleware, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}` });
});

app.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}`, role: req.user.role });
});

app.post('/admin-only', authMiddleware, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome admin!' });
});

setupSwagger(app); // ➕ Ajoute la route /docs

// ❌ Route inconnue
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// 🛠 Gestion centralisée des erreurs
app.use(errorHandler);

// 🕛 Cron job quotidien (ex: snapshot utilisateurs)
require('./cron/snapshotCron');

// Export pour tests & server.js
module.exports = { app, sequelize };
