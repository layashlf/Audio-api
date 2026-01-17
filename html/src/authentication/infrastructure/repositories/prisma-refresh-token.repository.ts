import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RefreshToken } from '../../domain/entities/refresh-token';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenAndUserId(
    token: string,
    userId: string,
  ): Promise<RefreshToken | null> {
    const tokenData = await this.prisma.refreshToken.findFirst({
      where: {
        token: await this.hashToken(token),
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenData) {
      return null;
    }

    return RefreshToken.fromPersistence(tokenData);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenData = await this.prisma.refreshToken.findFirst({
      where: {
        token: await this.hashToken(token),
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!tokenData) {
      return null;
    }

    return RefreshToken.fromPersistence(tokenData);
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const tokenData = refreshToken.toPersistence();
    await this.prisma.refreshToken.upsert({
      where: { id: refreshToken.id },
      update: tokenData,
      create: tokenData,
    });
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async revoke(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  private async hashToken(token: string): Promise<string> {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(token, 10);
  }
}
