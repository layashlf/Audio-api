import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';
import { SubscriptionTier } from '@prisma/client';
import { PaginationMetaDto } from '../../dto/pagination-response.dto';

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
  ): Promise<{ users: User[]; total: number; pagination: PaginationMetaDto }> {
    const cacheKey = `users:list:${limit}:${offset}:${filters?.subscriptionStatus || 'all'}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<{
      users: User[];
      total: number;
      pagination: PaginationMetaDto;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const [users, total] = await Promise.all([
      this.userRepository.findAll(limit, offset, filters),
      this.userRepository.count(filters),
    ]);

    // Calculate pagination metadata
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMetaDto = {
      total_records: total,
      current_page: currentPage,
      total_pages: totalPages,
      next_page: currentPage < totalPages ? currentPage + 1 : null,
      prev_page: currentPage > 1 ? currentPage - 1 : null,
      per_page: limit,
      offset: offset,
    };

    const result = { users, total, pagination };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }
}
