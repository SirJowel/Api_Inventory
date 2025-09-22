import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { redisService } from '../services/RedisService';

export const cacheMiddleware = (ttl: number = 300, keyPrefix: string = 'cache') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Generar clave de cache basada en URL y query params
            const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;
            
            // Intentar obtener del cache
            const cachedData = await redisService.get(cacheKey);
            
            if (cachedData) {
                console.log(`🎯 Cache HIT: ${cacheKey}`);
                res.json(cachedData);
                return;
            }

            console.log(`🔍 Cache MISS: ${cacheKey}`);

            // Interceptar la respuesta para guardar en cache
            const originalJson = res.json;
            res.json = function(data: any) {
                // Solo cachear respuestas exitosas
                if (res.statusCode === 200 && data.success) {
                    redisService.set(cacheKey, data, ttl).catch(console.error);
                }
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Error en cache middleware:', error);
            next(); // Continuar sin cache en caso de error
        }
    };
};

export const invalidateCache = (pattern: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Ejecutar el controlador primero
        const originalJson = res.json;
        res.json = function(data: any) {
            // Si la operación fue exitosa, invalidar cache
            if (res.statusCode === 200 || res.statusCode === 201) {
                invalidateCachePattern(pattern).catch(console.error);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};

async function invalidateCachePattern(pattern: string): Promise<void> {
    try {
        const client = redisService.getClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
            console.log(`🗑️ Cache invalidated: ${keys.length} keys with pattern ${pattern}`);
        }
    } catch (error) {
        console.error('Error invalidating cache:', error);
    }
}