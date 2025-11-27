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


export const validateFile = (schema: z.ZodSchema, required: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Si no hay archivo
      if (!req.file) {
        if (required) {
          res.status(400).json({
            success: false,
            message: 'Archivo de imagen es requerido',
            data: null
          });
          return;
        }
        // Si no es requerido, continuar
        next();
        return;
      }

      // Validar el archivo con el schema de Zod
      const fileData = { file: req.file };
      schema.parse(fileData);
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Archivo inválido',
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

