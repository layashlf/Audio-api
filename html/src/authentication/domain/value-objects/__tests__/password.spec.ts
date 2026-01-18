import { Password } from '../password';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create password with valid length', async () => {
      // Arrange & Act
      const password = await Password.create('validpassword123');

      // Assert
      expect(password).toBeInstanceOf(Password);
      expect(typeof password.getHashedValue()).toBe('string');
      expect(password.getHashedValue().length).toBeGreaterThan(0);
    });

    it('should throw error for password too short', async () => {
      // Arrange & Act & Assert
      await expect(Password.create('short')).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
      await expect(Password.create('1234567')).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });

    it('should accept minimum 8 character password', async () => {
      // Arrange & Act
      const password = await Password.create('12345678');

      // Assert
      expect(password).toBeInstanceOf(Password);
    });

    it('should use custom salt rounds', async () => {
      // Arrange & Act
      const password = await Password.create('validpassword123', 12);

      // Assert
      expect(password).toBeInstanceOf(Password);
    });
  });

  describe('fromHash', () => {
    it('should create password from existing hash', () => {
      // Arrange
      const hashedValue = '$2b$10$abcdefghijklmnopqrstuvwx';

      // Act
      const password = Password.fromHash(hashedValue);

      // Assert
      expect(password).toBeInstanceOf(Password);
      expect(password.getHashedValue()).toBe(hashedValue);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      // Arrange
      const plainPassword = 'mypassword123';
      const password = await Password.create(plainPassword);

      // Act
      const isValid = await password.compare(plainPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      // Arrange
      const password = await Password.create('correctpassword');

      // Act
      const isValid = await password.compare('wrongpassword');

      // Assert
      expect(isValid).toBe(false);
    });

    it('should handle special characters', async () => {
      // Arrange
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const password = await Password.create(specialPassword);

      // Act
      const isValid = await password.compare(specialPassword);

      // Assert
      expect(isValid).toBe(true);
    });
  });

  describe('security', () => {
    it('should produce different hashes for same password', async () => {
      // Arrange & Act
      const password1 = await Password.create('samepassword');
      const password2 = await Password.create('samepassword');

      // Assert
      expect(password1.getHashedValue()).not.toBe(password2.getHashedValue());
    });

    it('should have proper bcrypt hash format', async () => {
      // Arrange
      const password = await Password.create('testpassword');

      // Act
      const hash = password.getHashedValue();

      // Assert
      expect(hash.startsWith('$2')).toBe(true); // bcrypt format
      expect(hash.length).toBeGreaterThan(50); // reasonable hash length
    });
  });
});
