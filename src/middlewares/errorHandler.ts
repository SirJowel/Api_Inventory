import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware global de manejo de errores
 * Debe ir al final de todas las rutas en index.ts
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error para debugging
  console.error('🚨 Error capturado:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Errores de validación con Zod
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      data: null,
      errors: error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    });
    return;
  }

  // Errores personalizados de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: null
    });
    return;
  }

  // Errores de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido o malformado',
      data: null
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado. Por favor, inicie sesión nuevamente',
      data: null
    });
    return;
  }

  if (error.name === 'NotBeforeError') {
    res.status(401).json({
      success: false,
      message: 'Token no válido aún',
      data: null
    });
    return;
  }

  // Errores de Multer (subida de archivos)
  if (error.message.includes('File too large')) {
    res.status(400).json({
      success: false,
      message: 'Archivo demasiado grande (máximo 5MB)',
      data: null
    });
    return;
  }

  if (error.message.includes('Unexpected field')) {
    res.status(400).json({
      success: false,
      message: 'Campo de archivo no válido. Use "image" como nombre del campo',
      data: null
    });
    return;
  }

  if (error.message.includes('Only images are allowed')) {
    res.status(400).json({
      success: false,
      message: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)',
      data: null
    });
    return;
  }

  // Errores de base de datos - PostgreSQL/TypeORM
  if (error.message.includes('duplicate key')) {
    const match = error.message.match(/Key \(([^)]+)\)/);
    const field = match ? match[1] : 'campo';
    res.status(409).json({
      success: false,
      message: `Ya existe un registro con este ${field}`,
      data: null
    });
    return;
  }

  if (error.message.includes('foreign key constraint')) {
    res.status(400).json({
      success: false,
      message: 'Operación inválida: existen registros relacionados',
      data: null
    });
    return;
  }

  if (error.message.includes('violates not-null constraint')) {
    const match = error.message.match(/column "([^"]+)"/);
    const field = match ? match[1] : 'requerido';
    res.status(400).json({
      success: false,
      message: `El campo ${field} es requerido`,
      data: null
    });
    return;
  }

  if (error.message.includes('invalid input syntax')) {
    res.status(400).json({
      success: false,
      message: 'Formato de datos inválido',
      data: null
    });
    return;
  }

  // Errores de conexión a servicios externos
  if (error.message.includes('ECONNREFUSED')) {
    res.status(503).json({
      success: false,
      message: 'Servicio no disponible temporalmente. Intente más tarde',
      data: null
    });
    return;
  }

  if (error.message.includes('ETIMEDOUT') || error.message.includes('ESOCKETTIMEDOUT')) {
    res.status(504).json({
      success: false,
      message: 'Tiempo de espera agotado. Intente nuevamente',
      data: null
    });
    return;
  }

  // Errores de Redis
  if (error.message.includes('Redis') || error.message.includes('ECONNRESET')) {
    console.warn('⚠️ Error de Redis, continuando sin cache:', error.message);
    // No enviar respuesta si ya se envió una
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error en el sistema de cache',
        data: null
      });
    }
    return;
  }

  // Errores de TypeORM específicos
  if (error.name === 'QueryFailedError') {
    res.status(400).json({
      success: false,
      message: 'Error en la consulta de base de datos',
      data: null
    });
    return;
  }

  if (error.name === 'EntityNotFoundError') {
    res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      data: null
    });
    return;
  }

  // Error por defecto (500)
  const statusCode = (error as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      error: error.name 
    })
  });
};

/**
 * Middleware para rutas no encontradas (404)
 * Debe ir antes del errorHandler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} no encontrada`,
    data: null
  });
};

/**
 * Wrapper para funciones async en controladores
 * Evita tener que usar try-catch en cada método
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
