const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, sequelize } = require('../app');
const { User, Post } = sequelize.models;

require('dotenv').config(); // chargement de .env si besoin

// 🔐 Override du secret pour cohérence avec le test
process.env.JWT_SECRET = 'mon_secret_access_token';

// Utilisateur simulé
const fakeUser = {
    id: 123,
    role: 'admin',
    username: 'FakeUser',
    discordId: '12345',
    avatar: 'htt.jpg'
};

let accessToken;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Création manuelle de l'utilisateur (facultatif si pas vérifié côté middleware)
    await User.create(fakeUser);

    // Token signé (valide 15min)
    accessToken = jwt.sign(
        { id: fakeUser.id, role: fakeUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
});

describe('🔐 Tests des routes protégées avec JWT', () => {

    /**
     * @test Vérifie que /private sans token renvoie une erreur
     */
    it('❌ /private : refuse sans token', async () => {
        await request(app)
            .get('/private')
            .expect(401);
    });

    /**
     * @test Vérifie que /private avec token retourne un message
     */
    it('✅ /private : accepte avec token', async () => {
        const res = await request(app)
            .get('/private')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.message).toContain('Welcome user');
    });

    /**
     * @test Vérifie que /admin-only sans token est rejeté
     */
    it('❌ /admin-only : refuse sans token', async () => {
        await request(app)
            .post('/admin-only')
            .expect(401);
    });

    /**
     * @test Vérifie que /admin-only est OK avec un token admin
     */
    it('✅ /admin-only : accepte avec rôle admin', async () => {
        const res = await request(app)
            .post('/admin-only')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.message).toBe('Welcome admin!');
    });

});
