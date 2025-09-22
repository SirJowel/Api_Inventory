import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/env';

// Interface para el payload del JWT
export interface JwtTokenPayload {
  id: number;
  email: string;
  role: string;
}

// Función para generar JWT con configuración completa
export const generateJwtToken = (payload: JwtTokenPayload): string => {
  // Usar any para evitar problemas de tipos con versiones de @types/jsonwebtoken
  return jwt.sign(
    payload, 
    jwtConfig.secret, 
    {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer: 'api-inventario',
      audience: 'api-users'
    } as any
  );
};

// Función para verificar JWT con configuración completa
export const verifyJwtToken = (token: string): JwtTokenPayload => {
  return jwt.verify(token, jwtConfig.secret, {
    algorithms: [jwtConfig.algorithm],
    issuer: 'api-inventario',
    audience: 'api-users'
  } as any) as unknown as JwtTokenPayload;
};

// Función para decodificar JWT sin verificar (útil para debugging)
export const decodeJwtToken = (token: string): JwtTokenPayload | null => {
  try {
    return jwt.decode(token) as JwtTokenPayload;
  } catch (error) {
    return null;
  }
};