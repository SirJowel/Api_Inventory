import { z } from 'zod';

// Base user schema with common validations
const baseUserSchema = z.object({
  name: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(255, 'Nombre no puede exceder 255 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),
  
  rol: z.enum(['admin', 'user', 'manager'], {
    message: 'Rol debe ser: admin, user o manager'
  }).default('user')
});

// Create user schema (with password)
export const createUserSchema = baseUserSchema.extend({
  password: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número')
});

// Update user schema (all fields optional)
export const updateUserSchema = baseUserSchema.partial().extend({
  password: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número')
    .optional()
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Contraseña requerida')
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Contraseña actual requerida'),
  
  newPassword: z.string()
    .min(8, 'Nueva contraseña debe tener al menos 8 caracteres')
    .max(100, 'Nueva contraseña no puede exceder 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número'),
  
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// User response schema (without password)
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Type inference
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;