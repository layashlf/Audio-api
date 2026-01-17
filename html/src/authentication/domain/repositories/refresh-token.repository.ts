import { RefreshToken } from '../entities/refresh-token';

export interface IRefreshTokenRepository {
  findByTokenAndUserId(
    token: string,
    userId: string,
  ): Promise<RefreshToken | null>;
  save(refreshToken: RefreshToken): Promise<void>;
  revokeByUserId(userId: string): Promise<void>;
  revoke(tokenId: string): Promise<void>;
}
