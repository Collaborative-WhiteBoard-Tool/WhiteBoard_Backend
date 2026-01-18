import { getRedisClient } from '../config/redis.js';
import { UserPresence } from '../types/socket/canvas.type.js';


export class PresenceService {
    private get redis() {
        return getRedisClient();
    }
    private readonly TTL = 30; // 30 seconds

    // Add user to whiteboard (O(1))
    async addUser(whiteboardId: string, presence: UserPresence): Promise<void> {
        const key = `presence:${whiteboardId}`;
        const value = JSON.stringify(presence);
        console.log('value stringify', value)

        await this.redis.hset(key, presence.userId, value);
        await this.redis.expire(key, this.TTL);
    }

    // Remove user from whiteboard (O(1))
    async removeUser(whiteboardId: string, userId: string): Promise<void> {
        const key = `presence:${whiteboardId}`;
        await this.redis.hdel(key, userId);
    }

    // Get all users in whiteboard (O(N) but N is small)
    async getUsers(whiteboardId: string): Promise<UserPresence[]> {
        const key = `presence:${whiteboardId}`;
        const data = await this.redis.hgetall(key);
        return Object.values(data).map(v => JSON.parse(v));
    }

    // Update heartbeat
    async heartbeat(whiteboardId: string, userId: string): Promise<void> {
        const key = `presence:${whiteboardId}`;
        const userData = await this.redis.hget(key, userId);

        if (userData) {
            const presence: UserPresence = JSON.parse(userData);
            presence.lastSeen = Date.now();
            await this.redis.hset(key, userId, JSON.stringify(presence));
            await this.redis.expire(key, this.TTL);
        }
    }

    // Clean stale users (called periodically)
    async cleanStaleUsers(whiteboardId: string, maxAge: number = 60000): Promise<string[]> {
        const users = await this.getUsers(whiteboardId);
        const now = Date.now();
        const staleUserIds: string[] = [];

        for (const user of users) {
            if (now - user.lastSeen > maxAge) {
                await this.removeUser(whiteboardId, user.userId);
                staleUserIds.push(user.userId);
            }
        }

        return staleUserIds;
    }
}