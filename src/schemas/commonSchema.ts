import { z } from 'zod';

// Common ID parameter schemas
export const idParamSchema = z.object({
  id: z.string()
    .min(1, 'ID es requerido')
    .transform(val => {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        throw new z.ZodError([{
          code: 'custom',
          message: 'ID debe ser un número positivo',
          path: ['id']
        }]);
      }
      return num;
    })
});

export const uuidParamSchema = z.object({
  id: z.string()
    .uuid('ID debe ser un UUID válido')
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number()
    .int('Página debe ser un número entero')
    .min(1, 'Página debe ser mayor a 0')
    .default(1),
  
  limit: z.coerce.number()
    .int('Límite debe ser un número entero')
    .min(1, 'Límite debe ser mayor a 0')
    .max(100, 'Límite no puede ser mayor a 100')
    .default(10),
  
  sortBy: z.string()
    .optional(),
  
  sortOrder: z.enum(['asc', 'desc'], {
    message: 'Orden debe ser: asc o desc'
  }).default('asc')
});

// Search schemas
export const searchSchema = z.object({
  q: z.string()
    .min(1, 'Término de búsqueda debe tener al menos 1 carácter')
    .max(255, 'Término de búsqueda muy largo')
    .trim()
    .optional(),
  
  fields: z.string()
    .transform(val => val?.split(',').map(field => field.trim()))
    .optional()
});

// Date range schemas
export const dateRangeSchema = z.object({
  startDate: z.string()
    .datetime('Fecha de inicio debe ser una fecha válida en formato ISO')
    .transform(val => new Date(val))
    .optional(),
  
  endDate: z.string()
    .datetime('Fecha de fin debe ser una fecha válida en formato ISO')
    .transform(val => new Date(val))
    .optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: 'Fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate']
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type),
      'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'
    ),
    size: z.number().max(5 * 1024 * 1024, 'El archivo no puede ser mayor a 5MB'),
    buffer: z.instanceof(Buffer).optional(),
    path: z.string().optional()
  })
});

// API Response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.any(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }).optional()
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  data: z.null(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional()
  })).optional()
});

// Bulk operations schemas
export const bulkOperationSchema = z.object({
  ids: z.array(z.string())
    .min(1, 'Debe seleccionar al menos un elemento')
    .max(100, 'No puede seleccionar más de 100 elementos'),
  
  action: z.string()
    .min(1, 'Acción es requerida')
});

// Role-based access schemas
export const roleSchema = z.enum(['admin', 'user', 'manager'], {
  message: 'Rol debe ser: admin, user o manager'
});

// Filter by status schemas
export const statusFilterSchema = z.object({
  status: z.enum(['active', 'inactive', 'all'], {
    message: 'Estado debe ser: active, inactive o all'
  }).default('all')
});

// Common validation middleware schema
export const validationOptionsSchema = z.object({
  abortEarly: z.boolean().default(false),
  stripUnknown: z.boolean().default(true),
  allowUnknown: z.boolean().default(false)
});

// Export types
export type IdParam = z.infer<typeof idParamSchema>;
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
export type StatusFilterInput = z.infer<typeof statusFilterSchema>;