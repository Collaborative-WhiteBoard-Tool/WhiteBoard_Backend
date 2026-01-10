import { Redis } from "ioredis";

let redisClient: Redis;
let redisSubscriber: Redis;
let redisPublisher: Redis;

export const connectRedis = async (): Promise<void> => {
    const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    };

    try {
        // Main client for general operations
        redisClient = new Redis(redisConfig);

        // Separate clients for pub/sub (Redis requirement)
        redisPublisher = new Redis(redisConfig);
        redisSubscriber = new Redis(redisConfig);

        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
        });

        redisClient.on('error', (err: unknown) => {
            console.error('❌ Redis error:', err);
        });

        // Test connection
        await redisClient.ping();
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        throw error;
    }
};

export const getRedisClient = (): Redis => {
    if (!redisClient) {
        throw new Error('Redis not initialized. Call connectRedis first.');
    }
    return redisClient;
};

export const getRedisPublisher = (): Redis => {
    if (!redisPublisher) {
        throw new Error('Redis publisher not initialized.');
    }
    return redisPublisher;
};

export const getRedisSubscriber = (): Redis => {
    if (!redisSubscriber) {
        throw new Error('Redis subscriber not initialized.');
    }
    return redisSubscriber;
};

export const closeRedis = async (): Promise<void> => {
    if (redisClient) await redisClient.quit();
    if (redisPublisher) await redisPublisher.quit();
    if (redisSubscriber) await redisSubscriber.quit();
    console.log('✅ Redis connections closed');
};
