import Redis from 'ioredis';
import {env} from '../config/env';

class RedisService {
    private client: Redis | null = null;
    private isConnected: boolean = false;
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 3;
    private useMemoryFallback: boolean = false;
    private memoryCache: Map<string, { value: any; expiry?: number }> = new Map();

    constructor() {
        this.initializeRedis();
    }

    private initializeRedis(): void {
        try {
            this.client = new Redis({
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
                ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
                maxRetriesPerRequest: 2,
                retryStrategy: (times) => {
                    if (times > this.maxConnectionAttempts) {
                        console.log('⚠️  Redis: Máximo de intentos alcanzado, usando modo memoria');
                        this.useMemoryFallback = true;
                        return null; // Detener reintentos
                    }
                    return Math.min(times * 200, 2000); // Esperar más entre reintentos
                },
                connectTimeout: 10000,
                lazyConnect: true,
                enableReadyCheck: false,
                db: 0
            });

            this.setupEventListeners();
        } catch (error) {
            console.error('❌ Error inicializando Redis, usando modo memoria:', error);
            this.useMemoryFallback = true;
        }
    }

    private setupEventListeners(): void {
        if (!this.client) return;

        this.client.on('connect', () => {
            console.log('✅ Redis: Conectado exitosamente');
            this.isConnected = true;
            this.connectionAttempts = 0;
            this.useMemoryFallback = false;
        });

        this.client.on('ready', () => {
            console.log('✅ Redis: Listo para usar');
            this.isConnected = true;
        });

        this.client.on('error', (error) => {
            this.connectionAttempts++;
            
            // Solo mostrar error cada 5 intentos para no saturar logs
            if (this.connectionAttempts % 5 === 0) {
                console.error(`⚠️  Redis Error (intento ${this.connectionAttempts}):`, error.message);
            }
            
            this.isConnected = false;
            
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
                console.log('💾 Redis no disponible, usando cache en memoria');
                this.useMemoryFallback = true;
            }
        });

        this.client.on('close', () => {
            if (this.isConnected) {
                console.log('⚠️  Redis: Conexión cerrada');
            }
            this.isConnected = false;
        });

        this.client.on('reconnecting', () => {
            console.log('🔄 Redis: Intentando reconectar...');
        });
    }

    async connect(): Promise<void> {
        if (this.useMemoryFallback) {
            console.log('💾 Usando cache en memoria (Redis no disponible)');
            return;
        }

        try {
            if (this.client) {
                await this.client.connect();
            }
        } catch (error) {
            console.error('⚠️  Error conectando a Redis, usando memoria:', error);
            this.useMemoryFallback = true;
        }
    }

    // Limpiar cache de memoria de entradas expiradas
    private cleanExpiredMemoryCache(): void {
        const now = Date.now();
        for (const [key, data] of this.memoryCache.entries()) {
            if (data.expiry && data.expiry < now) {
                this.memoryCache.delete(key);
            }
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.useMemoryFallback || !this.isConnected) {
                // Usar memoria
                const data: { value: string; expiry?: number } = { value: serializedValue };
                if (ttl) {
                    data.expiry = Date.now() + (ttl * 1000);
                }
                this.memoryCache.set(key, data);
                return;
            }

            // Usar Redis
            if (ttl) {
                await this.client!.setex(key, ttl, serializedValue);
            } else {
                await this.client!.set(key, serializedValue);
            }
        } catch (error) {
            // Fallback a memoria si Redis falla
            const data: { value: string; expiry?: number } = { value: JSON.stringify(value) };
            if (ttl) {
                data.expiry = Date.now() + (ttl * 1000);
            }
            this.memoryCache.set(key, data);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                // Limpiar expirados
                this.cleanExpiredMemoryCache();
                
                // Obtener de memoria
                const cached = this.memoryCache.get(key);
                if (!cached) return null;
                
                // Verificar si expiró
                if (cached.expiry && cached.expiry < Date.now()) {
                    this.memoryCache.delete(key);
                    return null;
                }
                
                return JSON.parse(cached.value);
            }

            // Usar Redis
            const value = await this.client!.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            // Fallback a memoria
            const cached = this.memoryCache.get(key);
            return cached ? JSON.parse(cached.value) : null;
        }
    }

    async del(key: string): Promise<void> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                this.memoryCache.delete(key);
                return;
            }

            await this.client!.del(key);
        } catch (error) {
            this.memoryCache.delete(key);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                this.cleanExpiredMemoryCache();
                return this.memoryCache.has(key);
            }

            const result = await this.client!.exists(key);
            return result === 1;
        } catch (error) {
            return this.memoryCache.has(key);
        }
    }

    async lpush(key: string, value: any): Promise<void> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                // Simular lista en memoria
                const existing = this.memoryCache.get(key);
                const list = existing ? JSON.parse(existing.value) : [];
                list.unshift(value);
                this.memoryCache.set(key, { value: JSON.stringify(list) });
                return;
            }

            await this.client!.lpush(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error pushing to list ${key}:`, error);
        }
    }

    async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                const cached = this.memoryCache.get(key);
                if (!cached) return [];
                const list = JSON.parse(cached.value);
                return list.slice(start, stop === -1 ? undefined : stop + 1);
            }

            const values = await this.client!.lrange(key, start, stop);
            return values.map(value => JSON.parse(value));
        } catch (error) {
            return [];
        }
    }

    async incr(key: string): Promise<number> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                const cached = this.memoryCache.get(key);
                const current = cached ? parseInt(cached.value) : 0;
                const newValue = current + 1;
                this.memoryCache.set(key, { value: newValue.toString() });
                return newValue;
            }

            return await this.client!.incr(key);
        } catch (error) {
            return 1; // Retornar 1 si falla
        }
    }

    async expire(key: string, seconds: number): Promise<void> {
        try {
            if (this.useMemoryFallback || !this.isConnected) {
                const cached = this.memoryCache.get(key);
                if (cached) {
                    cached.expiry = Date.now() + (seconds * 1000);
                }
                return;
            }

            await this.client!.expire(key, seconds);
        } catch (error) {
            // Ignorar error
        }
    }

    async addToBlacklist(token: string, expirationTime: number): Promise<void> {
        const key = `blacklist:${token}`;
        await this.set(key, true, expirationTime);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const key = `blacklist:${token}`;
        return await this.exists(key);
    }

    getClient(): Redis | null {
        return this.client;
    }

    isHealthy(): boolean {
        return this.isConnected || this.useMemoryFallback;
    }

    getStatus(): { connected: boolean; usingMemory: boolean; attempts: number } {
        return {
            connected: this.isConnected,
            usingMemory: this.useMemoryFallback,
            attempts: this.connectionAttempts
        };
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
        this.memoryCache.clear();
    }
}

export const redisService = new RedisService();