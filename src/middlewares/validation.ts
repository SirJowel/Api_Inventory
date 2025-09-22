import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Extend Request interface to include validated data
export interface ValidatedRequest<T = any, U = any, V = any> extends Request {
  validatedBody?: T;
  validatedParams?: U;
  validatedQuery?: V;
}

// Validation middleware factory
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      req.body = validatedData; // Also update original body
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      next(error);
    }
  };
};

export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest<any, T>, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de URL inválidos',
          data: null,
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: ValidatedRequest<any, any, T>, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          data: null,
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        });
        return;
      }
      next(error);
    }
  };
};

// Combined validation middleware
export const validate = <TBody = any, TParams = any, TQuery = any>(
  bodySchema?: z.ZodSchema<TBody>,
  paramsSchema?: z.ZodSchema<TParams>,
  querySchema?: z.ZodSchema<TQuery>
) => {
  return (req: ValidatedRequest<TBody, TParams, TQuery>, res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    
    try {
      if (bodySchema) {
        const validatedBody = bodySchema.parse(req.body);
        req.validatedBody = validatedBody;
        req.body = validatedBody;
      }
      
      if (paramsSchema) {
        const validatedParams = paramsSchema.parse(req.params);
        req.validatedParams = validatedParams;
      }
      
      if (querySchema) {
        const validatedQuery = querySchema.parse(req.query);
        req.validatedQuery = validatedQuery;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        })));
      }
      
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          data: null,
          errors
        });
        return;
      }
      
      next(error);
    }
  };
};

// File validation middleware
export const validateFile = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: number = 5 * 1024 * 1024 // 5MB
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Archivo requerido',
        data: null
      });
      return;
    }
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
        data: null
      });
      return;
    }
    
    if (req.file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: `Archivo muy grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`,
        data: null
      });
      return;
    }
    
    next();
  };
};