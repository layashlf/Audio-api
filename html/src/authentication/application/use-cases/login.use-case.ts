import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Email } from '../../domain/value-objects/email';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { TokenService } from '../../infrastructure/services/token.service';
import { RefreshToken } from '../../domain/entities/refresh-token';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = new Email(input.email);

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Authentication failed');
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new ForbiddenException('User is not active');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Authentication failed');
    }

    // Generate tokens
    const tokenPayload = { sub: user.id };
    const tokens = await this.tokenService.generateTokenPair(tokenPayload);

    // Create and save refresh token
    const refreshTokenExpiry = new Date(
      Date.now() +
        this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT') * 1000,
    );

    const refreshTokenEntity = await RefreshToken.create(
      uuidv4(),
      tokens.refreshToken,
      user.id,
      refreshTokenExpiry,
    );

    await this.refreshTokenRepository.save(refreshTokenEntity);

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
