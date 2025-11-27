import '../setup';
import { createUserSchema, loginSchema } from '../../schemas/userSchema';

describe('User Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate correct user data', () => {
      // Arrange
      const validUserData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'user'
      };

      // Act
      const result = createUserSchema.safeParse(validUserData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test User');
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.rol).toBe('user');
      }
    });

    it('should reject invalid email', () => {
      // Arrange
      const invalidUserData = {
        nombre: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
        rol: 'user'
      };

      // Act
      const result = createUserSchema.safeParse(invalidUserData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['email'],
              message: expect.stringContaining('Email')
            })
          ])
        );
      }
    });

    it('should reject weak password', () => {
      // Arrange
      const invalidUserData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: '123',
        rol: 'user'
      };

      // Act
      const result = createUserSchema.safeParse(invalidUserData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['password']
            })
          ])
        );
      }
    });

    it('should reject invalid role', () => {
      // Arrange
      const invalidUserData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        rol: 'invalid_role'
      };

      // Act
      const result = createUserSchema.safeParse(invalidUserData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['rol']
            })
          ])
        );
      }
    });

    it('should require all mandatory fields', () => {
      // Arrange
      const incompleteUserData = {
        email: 'test@example.com'
        // Missing nombre, password, rol
      };

      // Act
      const result = createUserSchema.safeParse(incompleteUserData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorPaths = result.error.issues.map(e => e.path[0]);
        expect(errorPaths).toContain('nombre');
        expect(errorPaths).toContain('password');
        // Note: 'rol' is optional and has a default value, so it won't appear in validation errors
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      // Arrange
      const validLoginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      // Act
      const result = loginSchema.safeParse(validLoginData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('Password123!');
      }
    });

    it('should reject missing password', () => {
      // Arrange
      const invalidLoginData = {
        email: 'test@example.com'
        // Missing password
      };

      // Act
      const result = loginSchema.safeParse(invalidLoginData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['password']
            })
          ])
        );
      }
    });

    it('should reject missing email', () => {
      // Arrange
      const invalidLoginData = {
        password: 'Password123!'
        // Missing email
      };

      // Act
      const result = loginSchema.safeParse(invalidLoginData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['email']
            })
          ])
        );
      }
    });

    it('should reject invalid email format', () => {
      // Arrange
      const invalidLoginData = {
        email: 'not-an-email',
        password: 'Password123!'
      };

      // Act
      const result = loginSchema.safeParse(invalidLoginData);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});