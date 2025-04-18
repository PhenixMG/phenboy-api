const {verify, sign} = require("jsonwebtoken");
const {compare, hash} = require("bcrypt");
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d'; // 7 jours
const { v4: uuidv4 } = require('uuid'); // Import uuid


const generateAccessToken = (userId, role) => {
    return sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

const generateRefreshToken = (userId, tokenId) => {
    return sign(
        { id: userId, jti: tokenId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES }
    );
};


exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user.id, user.role);

        const tokenId = uuidv4(); // Créer un ID unique pour le token
        const refreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
            token: tokenId,
            UserId: user.id,
            expiresAt
        });

        res.json({ accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        const storedToken = await RefreshToken.findOne({ where: { token: tokenId } });
        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (new Date() > storedToken.expiresAt) {
            await storedToken.destroy();
            return res.status(401).json({ message: 'Refresh token expired' });
        }

        const newAccessToken = generateAccessToken(decoded.id);

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenId = decoded.jti;

        await RefreshToken.destroy({ where: { token: tokenId } });

        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
};

// Nouveau : logout ALL sessions
exports.logoutAll = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        await RefreshToken.destroy({ where: { UserId: userId } });

        res.json({ message: 'Logged out from all devices' });
    } catch (err) {
        next(err);
    }
};

exports.register = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await hash(password, 10);
        const user = await User.create({ username, password: hashedPassword });

        // Générer les tokens dès l'inscription
        const accessToken = generateAccessToken(user.id, user.role);

        const tokenId = uuidv4(); // générer un jti
        const refreshToken = generateRefreshToken(user.id, tokenId);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
            token: tokenId,
            UserId: user.id,
            expiresAt
        });

        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err);
    }
};