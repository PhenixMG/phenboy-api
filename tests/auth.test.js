const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../app');
const { RefreshToken } = require('../models'); // <-- on importe ton modèle

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_secret_refresh';

const fakeUser = {
    id: 123,
    role: 'admin'
};

let refreshToken;
let tokenId;

beforeAll(async () => {
    await sequelize.sync({ force: true }); // reset base in memory

    tokenId = 'fake-token-id-123'; // Id du token
    refreshToken = jwt.sign(
        { id: fakeUser.id, jti: tokenId },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    // 👉 INSERER LE FAKE REFRESH TOKEN DANS SQLITE
    await RefreshToken.create({
        token: tokenId,
        UserId: fakeUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 jours
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
