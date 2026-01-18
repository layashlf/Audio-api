import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from '../login.use-case';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { TokenService } from '../../../infrastructure/services/token.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import { UserStatus } from '@prisma/client';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    };

    const mockRefreshTokenRepository = {
      findByTokenAndUserId: jest.fn(),
      findByToken: jest.fn(),
      save: jest.fn(),
      revokeByUserId: jest.fn(),
      revoke: jest.fn(),
    };

    const mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      generateTokenPair: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'IRefreshTokenRepository',
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get('IUserRepository');
    refreshTokenRepository = module.get('IRefreshTokenRepository');
    tokenService = module.get(TokenService);
    configService = module.get(ConfigService);
  });

  it('should login user successfully with correct credentials', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'correctpassword',
    };

    const mockUser = User.fromPersistence({
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      displayName: 'Test User',
      emailVerified: true,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    tokenService.generateTokenPair.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    configService.get.mockReturnValue(3600); // 1 hour in seconds
    refreshTokenRepository.save.mockResolvedValue();

    // Mock password verification
    jest.spyOn(Password.prototype, 'compare').mockResolvedValue(true);

    // Act
    const result = await useCase.execute(loginData);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      new Email('test@example.com'),
    );
    expect(tokenService.generateTokenPair).toHaveBeenCalledWith({
      sub: mockUser.id,
    });
    expect(configService.get).toHaveBeenCalledWith(
      'JWT_REFRESH_TOKEN_EXPIRE_AT',
    );
    expect(refreshTokenRepository.save).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      },
    });
  });

  it('should throw error if user not found', async () => {
    // Arrange
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password',
    };

    userRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(loginData)).rejects.toThrow(
      'Authentication failed',
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      new Email('nonexistent@example.com'),
    );
  });

  it('should throw error if password is incorrect', async () => {
    // Arrange
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const mockUser = User.fromPersistence({
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      displayName: 'Test User',
      emailVerified: true,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    userRepository.findByEmail.mockResolvedValue(mockUser);

    // Mock password verification to return false
    jest.spyOn(Password.prototype, 'compare').mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(loginData)).rejects.toThrow(
      'Authentication failed',
    );
    expect(tokenService.generateTokenPair).not.toHaveBeenCalled();
    expect(configService.get).not.toHaveBeenCalled();
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
