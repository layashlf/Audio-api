import { Email } from '../email';

describe('Email Value Object', () => {
  describe('creation', () => {
    it('should create email with valid format', () => {
      // Arrange & Act
      const email = new Email('test@example.com');

      // Assert
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should convert email to lowercase and trim', () => {
      // Arrange & Act
      const email = new Email('  Test@Example.COM  ');

      // Assert
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      // Arrange & Act & Assert
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
      expect(() => new Email('test@')).toThrow('Invalid email format');
      expect(() => new Email('@example.com')).toThrow('Invalid email format');
      expect(() => new Email('test')).toThrow('Invalid email format');
    });

    it('should accept various valid email formats', () => {
      // Arrange & Act & Assert
      expect(() => new Email('user.name+tag@example.co.uk')).not.toThrow();
      expect(() => new Email('test.email@subdomain.example.com')).not.toThrow();
      expect(() => new Email('123@example.com')).not.toThrow();
    });
  });

  describe('equality', () => {
    it('should return true for equal emails', () => {
      // Arrange
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      // Arrange
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(false);
    });

    it('should be case insensitive for equality', () => {
      // Arrange
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@EXAMPLE.COM');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });
  });
});
