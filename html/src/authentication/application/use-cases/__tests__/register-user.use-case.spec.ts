import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '../register-user.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import { UserStatus } from '@prisma/client';
import { SearchRepository } from '../../../../search/domain/repositories/search.repository';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let searchRepository: jest.Mocked<SearchRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
    };

    const mockSearchRepository = {
      indexAudio: jest.fn(),
      search: jest.fn(),
      indexUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'SearchRepository',
          useValue: mockSearchRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = module.get('IUserRepository');
    searchRepository = module.get('SearchRepository');
  });

  it('should register a new user successfully', async () => {
    // Arrange
    const registerData = {
      email: 'test@example.com',
      password: 'TestPass123',
      displayName: 'Test User',
      status: UserStatus.PENDING_APPROVAL,
    };

    userRepository.exists.mockResolvedValue(false);
    userRepository.save.mockResolvedValue(undefined);
    searchRepository.indexUser.mockResolvedValue(undefined);
    searchRepository.indexUser.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(registerData);

    // Assert
    expect(userRepository.exists).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: expect.any(String),
      email: 'test@example.com',
      displayName: 'Test User',
      status: 'PENDING_APPROVAL',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it('should throw error if email already exists', async () => {
    // Arrange
    const registerData = {
      email: 'existing@example.com',
      password: 'TestPass123',
      displayName: 'Test User',
      status: UserStatus.PENDING_APPROVAL,
    };

    userRepository.exists.mockResolvedValue(true);
    searchRepository.indexUser.mockResolvedValue(undefined);

    // Act & Assert
    await expect(useCase.execute(registerData)).rejects.toThrow(
      'Email already exists',
    );
    expect(userRepository.exists).toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should register user without display name', async () => {
    // Arrange
    const registerData = {
      email: 'test@example.com',
      password: 'TestPass123',
      status: UserStatus.PENDING_APPROVAL,
    };

    userRepository.exists.mockResolvedValue(false);
    userRepository.save.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(registerData);

    // Assert
    expect(result.displayName).toBeUndefined();
    expect(result.email).toBe('test@example.com');
  });
});
