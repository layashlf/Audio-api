import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(
    limit: number = 10,
    offset: number = 0,
    filters?: { subscriptionStatus?: SubscriptionTier },
  ): Promise<{ users: User[]; total: number }> {
    const cacheKey = `users:list:${limit}:${offset}:${filters?.subscriptionStatus || 'all'}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<{
      users: User[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const [users, total] = await Promise.all([
      this.userRepository.findAll(limit, offset, filters),
      this.userRepository.count(filters),
    ]);

    const result = { users, total };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }
}
