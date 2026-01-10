import { getRedisClient } from '../config/redis.js';
import { RateLimitConfig } from '../types/socket/canvas.type.js';


const DEFAULT_CONFIG: RateLimitConfig = {
    maxStrokesPerSecond: 50,
    maxStrokesPerMinute: 500,
    burstAllowance: 10,
};

export class RateLimitService {
    private config: RateLimitConfig;
    private get redis() {
        return getRedisClient();
    }

    constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
        this.config = config;
    }

    async checkRateLimit(userId: string, whiteboardId: string): Promise<boolean> {
        const now = Date.now();
        const secondKey = `ratelimit:${whiteboardId}:${userId}:${Math.floor(now / 1000)}`;
        const minuteKey = `ratelimit:${whiteboardId}:${userId}:${Math.floor(now / 60000)}`;

        const [secondCount, minuteCount] = await Promise.all([
            this.redis.incr(secondKey),
            this.redis.incr(minuteKey),
        ]);

        // Set expiry on first increment
        if (secondCount === 1) {
            await this.redis.expire(secondKey, 2);
        }
        if (minuteCount === 1) {
            await this.redis.expire(minuteKey, 120);
        }

        // Check limits
        if (secondCount > this.config.maxStrokesPerSecond + this.config.burstAllowance) {
            return false;
        }

        if (minuteCount > this.config.maxStrokesPerMinute) {
            return false;
        }

        return true;
    }

    async getRemainingQuota(
        userId: string,
        whiteboardId: string
    ): Promise<{ perSecond: number; perMinute: number }> {
        const now = Date.now();
        const secondKey = `ratelimit:${whiteboardId}:${userId}:${Math.floor(now / 1000)}`;
        const minuteKey = `ratelimit:${whiteboardId}:${userId}:${Math.floor(now / 60000)}`;

        const [secondCount, minuteCount] = await Promise.all([
            this.redis.get(secondKey),
            this.redis.get(minuteKey),
        ]);

        return {
            perSecond: this.config.maxStrokesPerSecond - parseInt(secondCount || '0'),
            perMinute: this.config.maxStrokesPerMinute - parseInt(minuteCount || '0'),
        };
    }
}