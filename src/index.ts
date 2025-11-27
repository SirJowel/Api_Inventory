import express,{Application} from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import morgan from 'morgan';
import { apiReference } from '@scalar/express-api-reference';

import { initializeDatabase } from './config/db';
import { swaggerSpec } from "./config/swagger";
import { redisService } from './services/RedisService';


// Importar rutas
import productRoutes from './routes/ProductRoutes';
import categoryRoutes from './routes/CategoryRoutes';
import userRoutes from './routes/UserRoutes';


import morganMiddleware from './middlewares/morgan';
import { authenticateToken } from './middlewares/auth';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';



// Configurar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Servir archivos estáticos desde uploads
app.use('/uploads', express.static('src/uploads'));

// Configurar Scalar API Reference (documentación moderna)
app.use(
  '/api-docs',
  apiReference({
    spec: {
      content: swaggerSpec,
    },
    theme: 'purple',
    layout: 'modern',
    defaultHttpClient: {
      targetKey: 'javascript',
      clientKey: 'fetch',
    },
    authentication: {
      preferredSecurityScheme: 'bearerAuth',
      http: {
        basic: {
          username: '',
          password: '',
        },
        bearer: {
          token: '',
        },
      },
    },
    customCss: `
      .scalar-api-client {
        border-radius: 8px;
      }
    `,
    darkMode: true,
    hideModels: false,
    hideDownloadButton: false,
    showSidebar: true,
  }),
);

// Ruta para obtener el JSON de OpenAPI (útil para otros clientes)
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Rutas públicas (sin autenticación)
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    const redisStatus = redisService.getStatus();
    res.json({ 
        success: true,
        message: 'API del Punto de Venta funcionando correctamente',
        timestamp: new Date().toISOString(),
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        services: {
            database: 'connected',
            redis: redisStatus.connected ? 'connected' : 'using-memory-fallback',
            cache: redisStatus.usingMemory ? 'memory' : 'redis'
        }
    });
});

// Rutas protegidas (requieren autenticación)
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

// app.use('/api/sales', saleRoutes);

// Middleware para rutas no encontradas (debe ir ANTES del error handler)
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ser el ÚLTIMO middleware)
app.use(errorHandler);

// Inicializar la aplicación
const startServer = async () => {
    try {
        // Inicializar la base de datos
        console.log('🔄 Conectando a la base de datos...');
        await initializeDatabase();
        console.log('✅ Base de datos conectada');

        // Ejecutar migraciones pendientes automáticamente
        console.log('🔄 Ejecutando migraciones...');
        try {
            const { AppDataSource } = await import('./config/db');
            await AppDataSource.runMigrations();
            console.log('✅ Migraciones ejecutadas correctamente');
        } catch (migrationError) {
            console.log('⚠️  No hay migraciones pendientes o ya están aplicadas');
        }

        // Intentar conectar Redis (no bloqueante)
        console.log('🔄 Conectando a Redis...');
        try {
            await redisService.connect();
            const status = redisService.getStatus();
            if (status.connected) {
                console.log('✅ Redis conectado');
            } else if (status.usingMemory) {
                console.log('💾 Usando cache en memoria (Redis no disponible)');
            }
        } catch (error) {
            console.log('⚠️  Redis no disponible, usando cache en memoria');
        }

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════');
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📍 API disponible en ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}/api`);
            console.log(`📚 Documentación: ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health check: ${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://localhost:${PORT}/api/health`);
            
            const redisStatus = redisService.getStatus();
            console.log(`💾 Cache: ${redisStatus.connected ? 'Redis' : 'Memoria'}`);
            console.log('═══════════════════════════════════════════════════');
        });
    } catch (error) {
        console.error('❌ Error al inicializar la aplicación:', error);
        process.exit(1);
    }
};

// Manejo graceful del cierre de la aplicación
process.on('SIGINT', () => {
    console.log('⏳ Cerrando aplicación...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('⏳ Cerrando aplicación...');
    process.exit(0);
});

// Iniciar la aplicación
startServer();