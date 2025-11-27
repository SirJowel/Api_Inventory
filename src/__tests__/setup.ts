import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';

// Mock del RedisService para testing
jest.mock('../services/RedisService', () => ({
  redisService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    addToBlacklist: jest.fn(),
    isTokenBlacklisted: jest.fn().mockResolvedValue(false),
    connect: jest.fn(),
    disconnect: jest.fn(),
    isHealthy: jest.fn().mockReturnValue(true),
    getClient: jest.fn().mockReturnValue({
      keys: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(0)
    })
  }
}));

// Base de datos de prueba en memoria
export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', 
  entities: [User, Product, Category],
  synchronize: true,
  logging: false,
  dropSchema: true
});

// Variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only-very-long-string';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_ALGORITHM = 'HS256';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.RATE_LIMIT_WINDOW = '900';

// Mock global para multer
jest.mock('../middlewares/multer', () => ({
  default: {
    single: () => (req: any, res: any, next: any) => next()
  }
}));

// Setup y teardown globales
beforeAll(async () => {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

beforeEach(async () => {
  if (testDataSource.isInitialized) {
    // Limpiar base de datos antes de cada test
    const entities = testDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
  
  // Limpiar mocks
  jest.clearAllMocks();
});

// Helper para crear datos de prueba
export const createTestUser = async () => {
  const userRepository = testDataSource.getRepository(User);
  const user = userRepository.create({
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$hash', // Password hasheado mock
    role: 'user'
  });
  return await userRepository.save(user);
};

export const createTestCategory = async () => {
  const categoryRepository = testDataSource.getRepository(Category);
  const category = categoryRepository.create({
    name: 'Test Category',
    description: 'Test Description',
    isActive: true
  });
  return await categoryRepository.save(category);
};

export const createTestProduct = async (categoryId?: string) => {
  const productRepository = testDataSource.getRepository(Product);
  let category;
  
  if (categoryId) {
    const categoryRepository = testDataSource.getRepository(Category);
    category = await categoryRepository.findOne({ where: { id: categoryId } });
  } else {
    category = await createTestCategory();
  }
  
  const product = productRepository.create({
    name: 'Test Product',
    description: 'Test Description',
    price: 100.00,
    stock: 50,
    barcode: 'TEST123',
    category: category!
  });
  return await productRepository.save(product);
};