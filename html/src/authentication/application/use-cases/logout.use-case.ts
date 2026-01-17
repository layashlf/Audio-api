import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

export interface LogoutInput {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    if (!input.refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    // Find the refresh token by its value and revoke it
    const refreshTokenEntity = await this.refreshTokenRepository.findByToken(
      input.refreshToken,
    );

    if (refreshTokenEntity) {
      await this.refreshTokenRepository.revoke(refreshTokenEntity.id);
    }
  }
}
