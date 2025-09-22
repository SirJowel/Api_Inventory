import express,{Application} from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { initializeDatabase } from './config/db';
import { swaggerSpec } from "./config/swagger";


// Importar rutas
import productRoutes from './routes/ProductRoutes';
import categoryRoutes from './routes/CategoryRoutes';
import userRoutes from './routes/UserRoutes';


import accessLogStream from './middlewares/morgan';
import { authenticateToken } from './middlewares/auth';



// Configurar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined',{stream:accessLogStream}));

// Servir archivos estáticos desde uploads
app.use('/uploads', express.static('src/uploads'));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "API Inventario - Documentación",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
    }
}));

// Ruta para obtener el JSON de OpenAPI
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Rutas públicas (sin autenticación)
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        message: 'API del Punto de Venta funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas protegidas (requieren autenticación)
app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);

// app.use('/api/sales', saleRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        message: 'API del Punto de Venta funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        data: null
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        data: null
    });
});

// Inicializar la aplicación
const startServer = async () => {
    try {
        // Inicializar la base de datos
        await initializeDatabase();
        
        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📍 API disponible en http://localhost:${PORT}/api`);
            console.log(`📚 Documentación Swagger en http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
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