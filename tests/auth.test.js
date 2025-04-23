// Forçage de variables d’environnement pour l’environnement de test
process.env.JWT_REFRESH_SECRET = 'mon_secret_refresh_token';
process.env.JWT_SECRET         = 'mon_secret_access_token';
process.env.COOKIE_SECRET      = 'ma_clef_cookie_pour_tests';
process.env.NODE_ENV           = 'test';

// Chargement du .env local si besoin
require('dotenv').config();

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../app'); // ton app Express + instance Sequelize
const { User } = sequelize.models;
const { RefreshToken } = sequelize.models;

// Utilisateur factice pour les tests
const fakeUser = {
    id: 123,
    role: 'admin',
    username: 'FakeUser',
    discordId: '12345',
    avatar: 'htt.jpg'
};

let refreshToken;
let tokenId;

// 💾 Préparation des données avant les tests
beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Insertion de l'utilisateur simulé
    await User.create({
        id: fakeUser.id,
        username: fakeUser.username,
        role: fakeUser.role
    });

    // Génération d’un fake refreshToken
    tokenId = 'fake-token-id-123';

    refreshToken = jwt.sign(
        { id: fakeUser.id, jti: tokenId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    await RefreshToken.create({
        token: tokenId,
        UserId: fakeUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
});

describe('🧪 Tests de l\'API Auth - /auth/me', () => {
    it('❌ devrait retourner 401 si aucun cookie fourni', async () => {
        const res = await request(app)
            .get('/auth/me')
            .expect(401);

        expect(res.body.message).toBe('Not authenticated');
    });

    it('❌ devrait retourner 401 si refreshToken est invalide', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Cookie', [`refreshToken=token_invalide`])
            .expect(401);

        expect(res.body.message).toBe('Invalid session');
    });

    it('✅ devrait retourner 200 avec un refreshToken valide simulé', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id', fakeUser.discordId); // à ajuster selon ce que renvoie ton contrôleur
        expect(res.body.user).toHaveProperty('username', fakeUser.username);
    });
});
