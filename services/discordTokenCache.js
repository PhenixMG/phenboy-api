const cacheManager = require('cache-manager').createCache;

const tokenCache = cacheManager({
    store: 'memory',
    ttl: 3600 // 1h
});

async function setToken(userId, token) {
    console.log(`Token de ${userId} mis en cache`);
    await tokenCache.set(`discord_token_${userId}`, token);
}

async function getToken(userId) {
    return await tokenCache.get(`discord_token_${userId}`);
}

async function deleteToken(userId) {
    await tokenCache.del(`discord_token_${userId}`);
}

module.exports = {
    setToken,
    getToken,
    deleteToken
};