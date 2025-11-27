import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/RedisService';
import { env } from '../config/env';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const rateLimitMiddleware = ( 
    maxRequests: number = env.RATE_LIMIT_MAX_REQUESTS,
    windowSeconds: number = env.RATE_LIMIT_WINDOW,
    keyGenerator?: (req: Request) => string
) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Generar clave única para el rate limiting
            let key: string;
            
            if (keyGenerator) {
                key = keyGenerator(req);
            } else if (req.user) {
                // Si hay usuario autenticado, usar su ID
                key = `rate_limit:user:${req.user.id}`;
            } else {
                // Si no hay usuario, usar IP
                const ip = req.ip || req.connection.remoteAddress || 'unknown';
                key = `rate_limit:ip:${ip}`;
            }

            // Incrementar contador
            const currentCount = await redisService.incr(key);
            
            // Si es la primera request, establecer TTL
            if (currentCount === 1) {
                await redisService.expire(key, windowSeconds);
            }

            // Verificar límite
            if (currentCount > maxRequests) {
                res.status(429).json({
                    success: false,
                    message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
                    data: null,
                    retryAfter: windowSeconds
                });
                return;
            }

            // Agregar headers informativos
            res.set({
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': Math.max(0, maxRequests - currentCount).toString(),
                'X-RateLimit-Reset': new Date(Date.now() + windowSeconds * 1000).toISOString()
            });

            next();
        } catch (error) {
            console.error('Error en rate limit middleware:', error);
            next(); // Continuar sin rate limiting en caso de error
        }
    };
};

// Rate limits específicos
export const strictRateLimit = rateLimitMiddleware(10, 300); // 10 requests en 5 min
export const normalRateLimit = rateLimitMiddleware(100, 900); // 100 requests en 15 min
export const lenientRateLimit = rateLimitMiddleware(1000, 3600); // 1000 requests en 1 hora