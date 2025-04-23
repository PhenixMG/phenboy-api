process.env.JWT_REFRESH_SECRET = 'mon_secret_refresh_token';
process.env.JWT_SECRET         = 'mon_secret_access_token';
process.env.COOKIE_SECRET      = 'ma_clef_cookie_pour_tests';
process.env.NODE_ENV           = 'test';

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../app');
const { User } = sequelize.models;
const { RefreshToken } = sequelize.models;

const fakeUser = {
    id: 123,
    role: 'admin',
    username: 'FakeUser',
    discordId: '12345',
    avatar: 'htt.jpg'
};

let refreshToken;
let tokenId;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Créer d'abord un User en BDD
    await User.create({
        id: fakeUser.id,
        username: fakeUser.username,
        role: fakeUser.role
    });

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

describe('Tests de l\'API Auth', () => {
    it('devrait retourner 401 si aucun cookie fourni', async () => {
        const res = await request(app)
            .get('/auth/me')
            .expect(401);

        expect(res.body.message).toBe('Not authenticated');
    });

    it('devrait retourner 401 si refreshToken est invalide', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Cookie', [`refreshToken=token_invalide`])
            .expect(401);

        expect(res.body.message).toBe('Invalid session');
    });

    it('devrait retourner 200 avec un refreshToken valide simulé', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(200);

        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('username');
    });
});
