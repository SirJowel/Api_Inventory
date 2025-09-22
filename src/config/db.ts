import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar todas las entidades aquí
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { User } from '../entities/User';
//import { Sale } from '../entities/Sale';
//import { SaleDetail } from '../entities/SaleDetail';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'table',
    synchronize:true, // Solo en desarrollo
    logging: process.env.NODE_ENV === 'development',
    entities: [
        Product,
        Category,
        User,
        //Sale,
        //SaleDetail
        // Agregar más entidades aquí conforme las vayas creando
    ],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    subscribers: [__dirname + '/../subscribers/*.{ts,js}'],
});

// Función para inicializar la conexión
export const initializeDatabase = async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos establecida correctamente');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};