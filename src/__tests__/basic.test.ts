describe('Basic Math Tests', () => {
  it('should add two numbers correctly', () => {
    // Arrange
    const a = 2;
    const b = 3;
    
    // Act
    const result = a + b;
    
    // Assert
    expect(result).toBe(5);
  });

  it('should multiply two numbers correctly', () => {
    // Arrange
    const a = 4;
    const b = 6;
    
    // Act
    const result = a * b;
    
    // Assert
    expect(result).toBe(24);
  });

  it('should handle arrays correctly', () => {
    // Arrange
    const array = [1, 2, 3, 4, 5];
    
    // Act
    const doubled = array.map(x => x * 2);
    const sum = array.reduce((acc, val) => acc + val, 0);
    
    // Assert
    expect(doubled).toEqual([2, 4, 6, 8, 10]);
    expect(sum).toBe(15);
    expect(array.length).toBe(5);
  });

  it('should work with async functions', async () => {
    // Arrange
    const asyncFunction = async (x: number) => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(x * 2), 10);
      });
    };
    
    // Act
    const result = await asyncFunction(5);
    
    // Assert
    expect(result).toBe(10);
  });
});

describe('String Operations', () => {
  it('should manipulate strings correctly', () => {
    // Arrange
    const text = 'Hello World';
    
    // Act
    const lowercase = text.toLowerCase();
    const words = text.split(' ');
    const reversed = text.split('').reverse().join('');
    
    // Assert
    expect(lowercase).toBe('hello world');
    expect(words).toEqual(['Hello', 'World']);
    expect(reversed).toBe('dlroW olleH');
  });

  it('should validate email format with regex', () => {
    // Arrange
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
    const invalidEmails = ['notanemail', 'test@', '@domain.com', 'test.domain.com'];
    
    // Act & Assert
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });
});

describe('Object Operations', () => {
  it('should handle object operations', () => {
    // Arrange
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      roles: ['user', 'admin']
    };
    
    // Act
    const userCopy = { ...user };
    const nameExists = 'name' in user;
    const keys = Object.keys(user);
    
    // Assert
    expect(userCopy).toEqual(user);
    expect(userCopy).not.toBe(user); // Different reference
    expect(nameExists).toBe(true);
    expect(keys).toContain('id');
    expect(keys).toContain('name');
    expect(user.roles).toContain('admin');
  });
});

describe('Error Handling', () => {
  it('should handle thrown errors', () => {
    // Arrange
    const throwError = () => {
      throw new Error('Something went wrong!');
    };
    
    // Act & Assert
    expect(throwError).toThrow('Something went wrong!');
    expect(throwError).toThrow(Error);
  });

  it('should handle async errors', async () => {
    // Arrange
    const asyncThrowError = async () => {
      throw new Error('Async error!');
    };
    
    // Act & Assert
    await expect(asyncThrowError()).rejects.toThrow('Async error!');
  });
});