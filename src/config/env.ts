import { z } from 'zod';

// Environment validation schema based on your env.d.ts
const envSchema = z.object({
  // Server configuration
  PORT: z.coerce.number()
    .int('Puerto debe ser un número entero')
    .min(1, 'Puerto debe ser mayor a 0')
    .max(65535, 'Puerto debe ser menor a 65536')
    .default(3000),
  
  // Database configuration
  DB_HOST: z.string()
    .min(1, 'DB_HOST no puede estar vacío')
    .default('localhost'),
  
  DB_PORT: z.coerce.number()
    .int('Puerto de base de datos debe ser un número entero')
    .min(1, 'Puerto de base de datos debe ser mayor a 0')
    .max(65535, 'Puerto de base de datos debe ser menor a 65536')
    .default(5432),
  
  DB_USER: z.string()
    .min(1, 'Usuario de base de datos no puede estar vacío'),
  
  DB_PASSWORD: z.string()
    .min(1, 'Contraseña de base de datos no puede estar vacía'),
  
  DB_NAME: z.string()
    .min(1, 'Nombre de base de datos no puede estar vacío'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    message: 'NODE_ENV debe ser: development, production o test'
  }).default('development'),
  
  // JWT configuration
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres para mayor seguridad')
    .refine(
      (secret) => !/^(secret|password|123|test)/.test(secret.toLowerCase()),
      'JWT_SECRET no debe usar valores comunes como "secret", "password", etc.'
    ),
  
  JWT_EXPIRES_IN: z.string()
    .regex(
      /^\d+[smhd]$/,
      'JWT_EXPIRES_IN debe tener formato: número seguido de s(segundos), m(minutos), h(horas), d(días). Ej: 1h, 30m, 7d'
    )
    .default('1h'),
  
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512'], {
    message: 'JWT_ALGORITHM debe ser: HS256, HS384 o HS512'
  }).default('HS256')
});

// Validate and parse environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Error de configuración de variables de entorno:');
    error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    console.error('\n💡 Verifica tu archivo .env y asegúrate de que todas las variables estén correctamente configuradas.');
    process.exit(1);
  }
  throw error;
}

// Export validated environment
export { env };

// Export schema for testing purposes
export { envSchema };

// Export type for TypeScript
export type Env = z.infer<typeof envSchema>;

// Helper function to check if we're in development
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Database connection string helper
export const getDatabaseUrl = () => {
  return `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
};

// JWT configuration object
export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  algorithm: env.JWT_ALGORITHM 
};