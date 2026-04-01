const redis = require('redis');

let client;

const initRedis = async () => {
    try {
        // Get Redis URL from environment or use default
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        client = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.warn('⚠️  Redis reconnection failed after 10 attempts - caching disabled');
                        return false; // Stop reconnecting
                    }
                    return retries * 100;
                },
            },
        });

        // Handle connection events
        client.on('error', (err) => {
            console.warn('⚠️  Redis Client Warning:', err.message);
        });

        client.on('connect', () => {
            console.log('✅ Redis Connected Successfully');
        });

        client.on('disconnect', () => {
            console.log('⚠️  Redis Disconnected - caching unavailable');
        });

        await client.connect();
        console.log('🔗 Redis connection established');

        return client;
    } catch (error) {
        console.warn('⚠️  Redis connection failed - app will run without caching');
        console.warn('   To use caching, start Redis: docker run -d -p 6379:6379 redis:latest');
        console.warn('   Error:', error.message);
        // Return null instead of crashing - app will work without Redis
        return null;
    }
};

const getRedisClient = () => {
    return client;
};

const closeRedis = async () => {
    if (client) {
        await client.quit();
        console.log('Redis connection closed');
    }
};

module.exports = {
    initRedis,
    getRedisClient,
    closeRedis,
};
