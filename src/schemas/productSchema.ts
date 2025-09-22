import { z } from 'zod';

// Base product schema with common validations
const baseProductSchema = z.object({
  name: z.string()
    .min(1, 'Nombre del producto es requerido')
    .max(255, 'Nombre no puede exceder 255 caracteres')
    .trim(),
  
  description: z.string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  barcode: z.string()
    .min(1, 'Código de barras es requerido')
    .max(50, 'Código de barras no puede exceder 50 caracteres')
    .trim()
    .regex(/^[A-Z0-9]+$/, 'Código de barras solo puede contener letras mayúsculas y números'),
  
  price: z.coerce.number()
    .positive('Precio debe ser mayor a 0')
    .max(999999.99, 'Precio no puede exceder 999,999.99')
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimals
  
  cost: z.coerce.number()
    .min(0, 'Costo no puede ser negativo')
    .max(999999.99, 'Costo no puede exceder 999,999.99')
    .transform(val => Math.round(val * 100) / 100)
    .default(0),
  
  stock: z.coerce.number()
    .int('Stock debe ser un número entero')
    .min(0, 'Stock no puede ser negativo')
    .max(999999, 'Stock no puede exceder 999,999')
    .default(0),
  
  minStock: z.coerce.number()
    .int('Stock mínimo debe ser un número entero')
    .min(0, 'Stock mínimo no puede ser negativo')
    .max(999999, 'Stock mínimo no puede exceder 999,999')
    .default(0),
  
  isActive: z.boolean()
    .default(true),
  
  categoryId: z.string()
    .uuid('ID de categoría debe ser un UUID válido')
    .optional()
});

// Create product schema
export const createProductSchema = baseProductSchema.extend({
  image: z.string()
    .url('URL de imagen inválida')
    .optional()
    .or(z.literal(''))
}).refine(data => data.price > data.cost, {
  message: 'El precio de venta debe ser mayor al costo',
  path: ['price']
});

// Update product schema (all fields optional except validations)
export const updateProductSchema = baseProductSchema.partial().extend({
  image: z.string()
    .url('URL de imagen inválida')
    .optional()
    .or(z.literal(''))
}).refine(data => {
  if (data.price !== undefined && data.cost !== undefined) {
    return data.price > data.cost;
  }
  return true;
}, {
  message: 'El precio de venta debe ser mayor al costo',
  path: ['price']
});

// Product search/filter schema
export const productSearchSchema = z.object({
  name: z.string()
    .min(1, 'Término de búsqueda debe tener al menos 1 carácter')
    .max(255, 'Término de búsqueda muy largo')
    .trim()
    .optional(),
  
  categoryId: z.string()
    .uuid('ID de categoría debe ser un UUID válido')
    .optional(),
  
  isActive: z.coerce.boolean()
    .optional(),
  
  lowStock: z.coerce.boolean()
    .optional(),
  
  minPrice: z.coerce.number()
    .positive('Precio mínimo debe ser mayor a 0')
    .optional(),
  
  maxPrice: z.coerce.number()
    .positive('Precio máximo debe ser mayor a 0')
    .optional()
}).refine(data => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: 'Precio mínimo debe ser menor o igual al precio máximo',
  path: ['maxPrice']
});

// Product stock update schema
export const updateStockSchema = z.object({
  stock: z.coerce.number()
    .int('Stock debe ser un número entero')
    .min(0, 'Stock no puede ser negativo')
    .max(999999, 'Stock no puede exceder 999,999'),
  
  operation: z.enum(['set', 'add', 'subtract'], {
    message: 'Operación debe ser: set, add o subtract'
  }),
  
  reason: z.string()
    .min(1, 'Razón del cambio es requerida')
    .max(255, 'Razón no puede exceder 255 caracteres')
    .trim()
    .optional()
});

// Product response schema
export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  barcode: z.string(),
  price: z.number(),
  cost: z.number(),
  stock: z.number(),
  minStock: z.number(),
  isActive: z.boolean(),
  image: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  // Virtual fields
  isLowStock: z.boolean().optional(),
  profitMargin: z.number().optional()
});

// Type inference
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;