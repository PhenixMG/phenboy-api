const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../app');

const { User } = sequelize.models;
const { Post } = sequelize.models;

// charge ton .env (optionnel si déjà fait dans app.js)
require('dotenv').config();

// OVERRIDE pour les tests : le même secret que dans ton .env côté API
process.env.JWT_SECRET = 'mon_secret_access_token';

// Simuler un user pour le token
const fakeUser = {
    id: 123,
    role: 'admin',
    username: 'FakeUser',
    discordId: '12345',
    avatar: 'htt.jpg'
};

let accessToken;

beforeAll(async () => {
    // Synchroniser la base de données en mémoire (SQLite)
    await sequelize.sync({ force: true });

    // Générer un AccessToken valide pour les tests
    accessToken = jwt.sign(
        { id: fakeUser.id, role: fakeUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
});

describe('Tests des routes protégées', () => {

    it('devrait refuser l\'accès à /private sans token', async () => {
        const res = await request(app)
            .get('/private')
            .expect(401); // Ton middleware doit envoyer un 401 Unauthorized
    });

    it('devrait accéder à /private avec un token valide', async () => {
        const res = await request(app)
            .get('/private')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.message).toContain('Welcome user');
    });

    it('devrait refuser /admin-only sans token', async () => {
        const res = await request(app)
            .post('/admin-only')
            .expect(401);
    });

    it('devrait accéder à /admin-only avec un token admin', async () => {
        const res = await request(app)
            .post('/admin-only')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.message).toBe('Welcome admin!');
    });

});
