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
    // Get all potential tokens for the user
    const tokenDataList = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Find the token that matches by comparing with hashed version
    for (const tokenData of tokenDataList) {
      const refreshToken = RefreshToken.fromPersistence(tokenData);
      if (await refreshToken.matchesToken(token)) {
        return refreshToken;
      }
    }

    return null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    // Get all potential tokens
    const tokenDataList = await this.prisma.refreshToken.findMany({
      where: {
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Find the token that matches by comparing with hashed version
    for (const tokenData of tokenDataList) {
      const refreshToken = RefreshToken.fromPersistence(tokenData);
      if (await refreshToken.matchesToken(token)) {
        return refreshToken;
      }
    }

    return null;
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
}
