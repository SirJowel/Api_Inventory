import Redis from 'ioredis';
import {env} from '../config/env';

class RedisService {
    private client: Redis;
    private isConnected: boolean = false;

    constructor() {
        this.client = new Redis({
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            //...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            db: 0
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.client.on('connect', () => {
            console.log('🔴 Redis: Conectado');
            this.isConnected = true;
        });

        this.client.on('error', (error) => {
            console.error('🔴 Redis Error:', error);
            this.isConnected = false;
        });

        this.client.on('close', () => {
            console.log('🔴 Redis: Conexión cerrada');
            this.isConnected = false;
        });
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('Error conectando a Redis:', error);
            throw error;
        }
    }

    // Métodos de cache básicos
    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.client.setex(key, ttl, serializedValue);
            } else {
                await this.client.set(key, serializedValue);
            }
        } catch (error) {
            console.error(`Error setting cache key ${key}:`, error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`Error deleting cache key ${key}:`, error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Error checking cache key ${key}:`, error);
            return false;
        }
    }

    // Métodos para listas
    async lpush(key: string, value: any): Promise<void> {
        try {
            await this.client.lpush(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error pushing to list ${key}:`, error);
        }
    }

    async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
        try {
            const values = await this.client.lrange(key, start, stop);
            return values.map(value => JSON.parse(value));
        } catch (error) {
            console.error(`Error getting list range ${key}:`, error);
            return [];
        }
    }

    // Métodos para rate limiting
    async incr(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.error(`Error incrementing ${key}:`, error);
            return 0;
        }
    }

    async expire(key: string, seconds: number): Promise<void> {
        try {
            await this.client.expire(key, seconds);
        } catch (error) {
            console.error(`Error setting expiration for ${key}:`, error);
        }
    }

    // Blacklist de JWT tokens
    async addToBlacklist(token: string, expirationTime: number): Promise<void> {
        const key = `blacklist:${token}`;
        await this.set(key, true, expirationTime);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const key = `blacklist:${token}`;
        return await this.exists(key);
    }

    getClient(): Redis {
        return this.client;
    }

    isHealthy(): boolean {
        return this.isConnected;
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export const redisService = new RedisService();