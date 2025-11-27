import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/env';

// Validar que el secret existe
if (!jwtConfig.secret) {
  throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}

console.log('✅ JWT configurado con HS256 (secret key)');

// Interface para el payload del JWT
export interface JwtTokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Genera un token JWT firmado con secret key (HS256)
 * @param payload - Datos del usuario (id, email, role)
 * @returns Token JWT firmado
 */
export const generateJwtToken = (payload: JwtTokenPayload): string => {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      algorithm: 'HS256',
      expiresIn: jwtConfig.expiresIn,
      issuer: 'api-inventario',
      audience: 'api-users'
    } as any);
  } catch (error) {
    console.error('❌ Error generating JWT:', error);
    throw new Error('Error al generar el token de autenticación');
  }
};

/**
 * Verifica un token JWT con secret key (HS256)
 * @param token - Token JWT a verificar
 * @returns Payload decodificado si el token es válido
 * @throws Error si el token es inválido o expirado
 */
export const verifyJwtToken = (token: string): JwtTokenPayload => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      algorithms: ['HS256'],
      issuer: 'api-inventario',
      audience: 'api-users'
    });
    return decoded as unknown as JwtTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token no válido aún');
    }
    throw new Error('Error al verificar el token');
  }
};

/**
 * Decodifica un token JWT sin verificar la firma
 * Útil para debugging o para obtener información sin validar
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado o null si hay error
 */
export const decodeJwtToken = (token: string): JwtTokenPayload | null => {
  try {
    const decoded = jwt.decode(token);
    return decoded as JwtTokenPayload;
  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
    return null;
  }
};

/**
 * Verifica si un token ha expirado sin validar la firma
 * @param token - Token JWT a verificar
 * @returns true si el token está expirado, false en caso contrario
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Obtiene el tiempo restante del token en segundos
 * @param token - Token JWT
 * @returns Segundos restantes o 0 si está expirado
 */
export const getTokenRemainingTime = (token: string): number => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - currentTime;
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};