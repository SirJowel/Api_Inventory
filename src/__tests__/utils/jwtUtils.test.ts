import '../setup';

// Mock the config/env module to prevent process.exit
jest.mock('../../config/env', () => ({
  JWT_SECRET: 'test-secret-key-for-testing-purposes-only-very-long-string',
  JWT_EXPIRES_IN: '1h',
  jwtConfig: {
    secret: 'test-secret-key-for-testing-purposes-only-very-long-string',
    expiresIn: '1h',
    algorithm: 'HS256' as const
  }
}));

import { generateJwtToken, verifyJwtToken } from '../../utils/jwtUtils';

describe('JWT Utils', () => {
  describe('generateJwtToken', () => {
    it('should generate a valid JWT token', () => {
      // Arrange
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'user'
      };

      // Act
      const token = generateJwtToken(payload);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should generate different tokens for different payloads', () => {
      // Arrange
      const payload1 = { id: '550e8400-e29b-41d4-a716-446655440001', email: 'user1@example.com', role: 'user' };
      const payload2 = { id: '550e8400-e29b-41d4-a716-446655440002', email: 'user2@example.com', role: 'admin' };

      // Act
      const token1 = generateJwtToken(payload1);
      const token2 = generateJwtToken(payload2);

      // Assert
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyJwtToken', () => {
    it('should verify a valid token and return payload', () => {
      // Arrange
      const payload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'user'
      };
      const token = generateJwtToken(payload);

      // Act
      const result = verifyJwtToken(token);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(payload.id);
      expect(result.email).toBe(payload.email);
      expect(result.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act & Assert
      expect(() => verifyJwtToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      // Arrange
      const malformedToken = 'not-a-jwt-token';

      // Act & Assert
      expect(() => verifyJwtToken(malformedToken)).toThrow();
    });

    it('should throw error for empty token', () => {
      // Act & Assert
      expect(() => verifyJwtToken('')).toThrow();
    });
  });

  describe('Token roundtrip', () => {
    it('should generate and verify token successfully', () => {
      // Arrange
      const originalPayload = {
        id: '550e8400-e29b-41d4-a716-446655440999',
        email: 'roundtrip@example.com',
        role: 'admin'
      };

      // Act
      const token = generateJwtToken(originalPayload);
      const verifiedPayload = verifyJwtToken(token);

      // Assert
      expect(verifiedPayload.id).toBe(originalPayload.id);
      expect(verifiedPayload.email).toBe(originalPayload.email);
      expect(verifiedPayload.role).toBe(originalPayload.role);
    });

    it('should handle different user roles', () => {
      // Arrange
      const roles = ['user', 'admin', 'manager'];

      for (const role of roles) {
        const payload = {
          id: '550e8400-e29b-41d4-a716-446655440123',
          email: `test-${role}@example.com`,
          role
        };

        // Act
        const token = generateJwtToken(payload);
        const verifiedPayload = verifyJwtToken(token);

        // Assert
        expect(verifiedPayload.role).toBe(role);
        expect(verifiedPayload.email).toBe(payload.email);
      }
    });
  });
});