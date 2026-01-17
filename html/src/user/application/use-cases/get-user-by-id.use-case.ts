import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(id: string): Promise<User | null> {
    const cacheKey = `users:${id}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const user = await this.userRepository.findById(id);

    if (user) {
      // Cache for 60 seconds
      await this.cacheManager.set(cacheKey, user, 60000);
    }

    return user;
  }
}
