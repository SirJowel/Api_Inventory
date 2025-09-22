import { Request, Response, NextFunction } from 'express';
import  { JwtPayload} from 'jsonwebtoken';

import { verifyJwtToken } from '../utils/jwtUtils';
import { redisService } from '../services/RedisService';


// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload & {
        id?: number;
        email?: string;
        role?: string;
    };
}

// Middleware to authenticate JWT token
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Token de acceso requerido',
            data: null
        });
        return;
    }

    try {
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            res.status(401).json({
                success: false,
                message: 'Token revocado. Inicia sesión nuevamente.',
                data: null
            });
            return;
        }
        const decoded = verifyJwtToken(token) as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({
            success: false,
            message: 'Token inválido o expirado',
            data: null
        });
        return;
    }
};

// Middleware to authorize based on roles
export const authorizeRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción',
                data: null
            });
            return;
        }
        next();
    };
};

// Middleware to check if user owns the resource or is admin
export const authorizeOwnerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userId = req.params.id ? parseInt(req.params.id) : null;
    const currentUserId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole === 'admin' || currentUserId === userId) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Solo puedes acceder a tu propia información o ser administrador',
            data: null
        });
        return;
    }
};

// Nuevo middleware para logout
export const logoutUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            // Decodificar token para obtener tiempo de expiración
            const decoded =  verifyJwtToken(token) as JwtPayload;
            const expirationTime = decoded.exp ? - Math.floor(Date.now() / 1000) : 0;
            
            // Agregar a blacklist solo si no ha expirado
            if (expirationTime > 0) {
                await redisService.addToBlacklist(token, expirationTime);
            }
        }

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente',
            data: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión',
            data: null
        });
    }
};