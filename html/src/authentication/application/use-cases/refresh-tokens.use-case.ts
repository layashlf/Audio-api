import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { RefreshToken } from '../../domain/entities/refresh-token';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface RefreshTokensInput {
  userId: string;
  refreshToken: string;
}

export interface RefreshTokensOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: RefreshTokensInput): Promise<RefreshTokensOutput> {
    // Find and validate refresh token
    const refreshTokenEntity =
      await this.refreshTokenRepository.findByTokenAndUserId(
        input.refreshToken,
        input.userId,
      );

    if (!refreshTokenEntity || !refreshTokenEntity.isValid()) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    // Mark the old refresh token as revoked
    // This prevents the same token from being used again
    // Each refresh gives a new token, old ones become invalid
    await this.refreshTokenRepository.revoke(refreshTokenEntity.id);

    // Get user
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Generate new tokens
    const tokenPayload = { sub: user.id };
    const tokens = await this.tokenService.generateTokenPair(tokenPayload);

    // Create and save new refresh token
    const refreshTokenExpiry = new Date(
      Date.now() +
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT') * 1000,
    );

    const newRefreshTokenEntity = await RefreshToken.create(
      uuidv4(),
      tokens.refreshToken,
      user.id,
      refreshTokenExpiry,
    );

    await this.refreshTokenRepository.save(newRefreshTokenEntity);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.getEmail().getValue(),
        displayName: user.getDisplayName(),
      },
    };
  }
}
