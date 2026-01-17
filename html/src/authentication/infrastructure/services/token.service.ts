import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenPayload } from '../../interfaces';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async generateAccessToken(
    payload: ITokenPayload,
    expiresIn?: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn:
        expiresIn ?? this.configService.get<number>('JWT_TOKEN_EXPIRE_AT'),
    });
  }

  async generateRefreshToken(payload: ITokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT'),
    });
  }

  async generateTokenPair(payload: ITokenPayload): Promise<TokenPair> {
    // Create both access and refresh tokens at the same time
    // Access tokens expire quickly, refresh tokens last longer
    // Different secrets for each type so compromising one doesn't affect the other
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<ITokenPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<ITokenPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    // Find the refresh token by its value and revoke it
    const refreshTokenEntity =
      await this.refreshTokenRepository.findByToken(token);

    if (refreshTokenEntity) {
      await this.refreshTokenRepository.revoke(refreshTokenEntity.id);
    }
  }
}
