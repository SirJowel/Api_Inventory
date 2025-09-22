import { z } from 'zod';

// Base category schema with common validations
const baseCategorySchema = z.object({
  name: z.string()
    .min(1, 'Nombre de la categoría es requerido')
    .max(255, 'Nombre no puede exceder 255 caracteres')
    .trim(),
  
  description: z.string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color debe ser un código hexadecimal válido (ej: #6366f1)')
    .default('#6366f1'),
  
  isActive: z.boolean()
    .default(true)
});

// Create category schema
export const createCategorySchema = baseCategorySchema;

// Update category schema (all fields optional)
export const updateCategorySchema = baseCategorySchema.partial();

// Category search/filter schema
export const categorySearchSchema = z.object({
  name: z.string()
    .min(1, 'Término de búsqueda debe tener al menos 1 carácter')
    .max(255, 'Término de búsqueda muy largo')
    .trim()
    .optional(),
  
  isActive: z.coerce.boolean()
    .optional(),
  
  hasProducts: z.coerce.boolean()
    .optional()
});

// Category with products count schema
export const categoryWithStatsSchema = z.object({
  includeProductCount: z.coerce.boolean()
    .default(false),
  
  includeActiveProductCount: z.coerce.boolean()
    .default(false)
});

// Category response schema
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Virtual fields
  activeProductCount: z.number().optional(),
  totalProducts: z.number().optional()
});

// Category bulk operations schema
export const bulkCategoryOperationSchema = z.object({
  categoryIds: z.array(z.string().uuid('ID de categoría debe ser un UUID válido'))
    .min(1, 'Debe seleccionar al menos una categoría')
    .max(100, 'No puede seleccionar más de 100 categorías'),
  
  operation: z.enum(['activate', 'deactivate', 'delete'], {
    message: 'Operación debe ser: activate, deactivate o delete'
  }),
  
  force: z.boolean()
    .default(false) // For delete operation with products
});

// Type inference
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategorySearchInput = z.infer<typeof categorySearchSchema>;
export type CategoryWithStatsInput = z.infer<typeof categoryWithStatsSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type BulkCategoryOperationInput = z.infer<typeof bulkCategoryOperationSchema>;