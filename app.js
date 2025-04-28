const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const serverRoutes = require('./routes/serverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const theDivisionRoutes = require('./routes/theDivisionRoutes');
const cors = require('cors');
const initModels = require("./models/initModels");

const app = express();

app.use(cors({
    origin: process.env.FRONT_URL || 'http://localhost:5173',
    credentials: true // ⬅️ Autorise l'envoi de cookies
}));


app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/admin', adminRoutes)
app.use('/api/td2', theDivisionRoutes)

initModels();
module.exports = app;