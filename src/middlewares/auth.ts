import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload & {
        id?: number;
        email?: string;
        role?: string;
    };
}

// Middleware to authenticate JWT token
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
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