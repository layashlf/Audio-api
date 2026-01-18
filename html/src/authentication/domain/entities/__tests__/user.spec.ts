import { User } from '../user';
import { Email } from '../../value-objects/email';
import { Password } from '../../value-objects/password';

describe('User Entity', () => {
  describe('creation', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const email = new Email('test@example.com');
      const password = Password.fromHash('hashed-password');
      const displayName = 'Test User';

      // Act
      const user = User.create('user-id', email, password, displayName);

      // Assert
      expect(user.id).toBe('user-id');
      expect(user.getEmail().getValue()).toBe('test@example.com');
      expect(user.getDisplayName()).toBe('Test User');
      expect(user.getStatus()).toBe('PENDING_APPROVAL');
    });

    it('should create user with default values', () => {
      // Arrange
      const email = new Email('test@example.com');
      const password = Password.fromHash('hashed-password');

      // Act
      const user = User.create('user-id', email, password);

      // Assert
      expect(user.getDisplayName()).toBeUndefined();
      expect(user.getStatus()).toBe('PENDING_APPROVAL');
    });
  });

  describe('business methods', () => {
    let user: User;

    beforeEach(() => {
      const email = new Email('test@example.com');
      const password = Password.fromHash('hashed-password');
      user = User.create('user-id', email, password, 'Test User');
    });

    it('should verify password correctly', async () => {
      // Arrange
      const plainPassword = 'plain-password';

      // Mock password comparison
      jest.spyOn(user.getPassword(), 'compare').mockResolvedValue(true);

      // Act
      const isValid = await user.comparePassword(plainPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should activate user', () => {
      // Act
      user.activate();

      // Assert
      expect(user.getStatus()).toBe('ACTIVE');
    });

    it('should suspend user', () => {
      // Act
      user.suspend();

      // Assert
      expect(user.getStatus()).toBe('SUSPENDED');
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', () => {
      // Arrange
      const email = new Email('test@example.com');
      const password = Password.fromHash('hashed-password');
      const user = User.create('user-id', email, password, 'Test User');

      // Act
      const persistence = user.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        displayName: 'Test User',
        status: 'PENDING_APPROVAL',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('fromPersistence', () => {
    it('should create user from persistence data', () => {
      // Arrange
      const persistenceData = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        displayName: 'Test User',
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const user = User.fromPersistence(persistenceData);

      // Assert
      expect(user.id).toBe('user-id');
      expect(user.getEmail().getValue()).toBe('test@example.com');
      expect(user.getDisplayName()).toBe('Test User');
      expect(user.getStatus()).toBe('ACTIVE');
    });
  });
});
