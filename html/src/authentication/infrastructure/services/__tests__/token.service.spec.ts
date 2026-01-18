import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '../token.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../../../domain/entities/user';
import { Email } from '../../../domain/value-objects/email';
import { Password } from '../../../domain/value-objects/password';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token';

describe('TokenService', () => {
  let service: TokenService;
  let configService: jest.Mocked<ConfigService>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockRefreshTokenRepository = {
      findByToken: jest.fn(),
      revoke: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        TokenService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'IRefreshTokenRepository',
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    configService = module.get(ConfigService);
    refreshTokenRepository = module.get('IRefreshTokenRepository');

    // Mock config values
    configService.get.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret-key',
        JWT_TOKEN_EXPIRE_AT: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret-key',
        JWT_REFRESH_TOKEN_EXPIRE_AT: '7d',
      };
      return config[key];
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', async () => {
      // Arrange
      const password = await Password.create('password');
      const user = User.create(
        'user-id',
        new Email('test@example.com'),
        password,
        'Test User',
      );
      const payload = { sub: user.id };

      // Act
      const token = await service.generateAccessToken(payload);

      // Assert
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify token contains correct payload
      const decoded = require('jsonwebtoken').verify(token, 'test-secret-key');
      expect(decoded.sub).toBe('user-id');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', async () => {
      // Arrange
      const password = await Password.create('password');
      const user = User.create(
        'user-id',
        new Email('test@example.com'),
        password,
        'Test User',
      );
      const payload = {
        sub: user.id,
        email: user.getEmail().getValue(),
        type: 'refresh',
      };

      // Act
      const token = await service.generateRefreshToken(payload);

      // Assert
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      // Arrange
      const password = await Password.create('password');
      const user = User.create(
        'user-id',
        new Email('test@example.com'),
        password,
        'Test User',
      );
      const payload = { sub: user.id };
      const token = await service.generateRefreshToken(payload);

      // Act
      const decoded = await service.verifyRefreshToken(token);

      // Assert
      expect(decoded.sub).toBe('user-id');
    });

    it('should throw error for invalid token', async () => {
      // Act & Assert
      await expect(
        service.verifyRefreshToken('invalid-token'),
      ).rejects.toThrow();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      // Arrange
      const token = 'refresh-token-to-revoke';
      const mockRefreshToken = RefreshToken.fromPersistence({
        id: 'token-id',
        token: 'hashed-token',
        userId: 'user-id',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        createdAt: new Date(),
      });
      refreshTokenRepository.findByToken.mockResolvedValue(mockRefreshToken);
      refreshTokenRepository.revoke.mockResolvedValue();

      // Act
      await service.revokeRefreshToken(token);

      // Assert
      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(token);
      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('token-id');
    });

    it('should not throw if token not found', async () => {
      // Arrange
      const token = 'non-existent-token';
      refreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(service.revokeRefreshToken(token)).resolves.not.toThrow();

      // Assert
      expect(refreshTokenRepository.findByToken).toHaveBeenCalledWith(token);
      expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
    });
  });
});
