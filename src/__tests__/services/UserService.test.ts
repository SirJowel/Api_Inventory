import '../setup';
import { UserService } from '../../services/UserService';
import { User } from '../../entities/User';
import { testDataSource, createTestUser } from '../setup';
import { CreateUserDto } from '../../DTOs/createUser';
import { UpdateUserDto } from '../../DTOs/updateUser';
import bcrypt from 'bcrypt';

// Mock bcrypt para testing
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let userService: UserService;
  let userRepository: any;

  beforeEach(() => {
    // Usar testDataSource en lugar de AppDataSource
    userRepository = testDataSource.getRepository(User);
    userService = new UserService();
    // Override del repository para usar el de testing
    (userService as any).userRepository = userRepository;
    
    // Reset mocks
    mockBcrypt.hash.mockClear();
    mockBcrypt.compare.mockClear();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user'
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      // Act
      const result = await userService.createUser(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.role).toBe(createUserDto.rol);
      expect((result as any).password).toBeUndefined(); // No debe retornar el hash
      expect(result.id).toBeDefined();
      expect(mockBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user'
      };

      // Crear usuario primero
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      await userService.createUser(createUserDto);

      // Act & Assert
      await expect(userService.createUser(createUserDto))
        .rejects
        .toThrow('Error al crear usuario: El email ya está registrado');
    });

    it('should hash password correctly', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user'
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      // Act
      await userService.createUser(createUserDto);

      // Assert
      expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const users = [
        { name: 'User 1', email: 'user1@test.com', password: 'Password123!', rol: 'user' as const },
        { name: 'User 2', email: 'user2@test.com', password: 'Password123!', rol: 'admin' as const }
      ];

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      for (const userData of users) {
        await userService.createUser(userData);
      }

      // Act
      const result = await userService.getAllUsers(1, 10);

      // Assert
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
      expect(result.users[0]?.name).toBe('User 1');
      expect(result.users[1]?.name).toBe('User 2');
    });

    it('should return empty array when no users exist', async () => {
      // Act
      const result = await userService.getAllUsers(1, 10);

      // Assert
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.pages).toBe(0);
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const users = Array.from({ length: 15 }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@test.com`,
        password: 'Password123!',
        rol: 'user' as const
      }));

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      for (const userData of users) {
        await userService.createUser(userData);
      }

      // Act
      const page1 = await userService.getAllUsers(1, 10);
      const page2 = await userService.getAllUsers(2, 10);

      // Assert
      expect(page1.users).toHaveLength(10);
      expect(page1.total).toBe(15);
      expect(page1.pages).toBe(2);

      expect(page2.users).toHaveLength(5);
      expect(page2.total).toBe(15);
      expect(page2.pages).toBe(2);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user' as const
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      const createdUser = await userService.createUser(userData);

      // Act
      const result = await userService.getUserById(createdUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdUser.id);
      expect(result?.email).toBe(userData.email);
      expect(result?.name).toBe(userData.name);
    });

    it('should return null when user not found', async () => {
      // Act
      const result = await userService.getUserById('00000000-0000-0000-0000-000000000999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user' as const
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      const createdUser = await userService.createUser(userData);

      const updateData: UpdateUserDto = {
        name: 'Updated User',
        rol: 'admin'
      };

      // Act
      const result = await userService.updateUser(createdUser.id, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result!.name).toBe('Updated User');
      expect(result!.role).toBe('admin');
      expect(result!.email).toBe(userData.email); // Email no cambia
    });

    it('should throw error when updating non-existent user', async () => {
      // Arrange
      const updateData: UpdateUserDto = {
        name: 'Updated User'
      };

      // Act & Assert
      await expect(userService.updateUser('00000000-0000-0000-0000-000000000999', updateData))
        .rejects
        .toThrow('Usuario no encontrado');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user' as const
      };

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      const createdUser = await userService.createUser(userData);

      // Act
      const result = await userService.deleteUser(createdUser.id);

      // Assert
      expect(result).toBe(true);
      
      // Verificar que el usuario ya no existe
      const deletedUser = await userService.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should return false when deleting non-existent user', async () => {
      // Act
      const result = await userService.deleteUser('00000000-0000-0000-0000-000000000999');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getUsersByRole', () => {
    it('should return users filtered by role', async () => {
      // Arrange
      const users = [
        { name: 'Admin User', email: 'admin@test.com', password: 'Password123!', rol: 'admin' as const },
        { name: 'Regular User 1', email: 'user1@test.com', password: 'Password123!', rol: 'user' as const },
        { name: 'Regular User 2', email: 'user2@test.com', password: 'Password123!', rol: 'user' as const }
      ];

      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);

      for (const userData of users) {
        await userService.createUser(userData);
      }

      // Act
      const adminUsers = await userService.getUsersByRole('admin');
      const regularUsers = await userService.getUsersByRole('user');

      // Assert
      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0]?.role).toBe('admin');
      expect(adminUsers[0]?.name).toBe('Admin User');

      expect(regularUsers).toHaveLength(2);
      expect(regularUsers[0]?.role).toBe('user');
      expect(regularUsers[1]?.role).toBe('user');
    });
  });
});