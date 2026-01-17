import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(
    id: string,
    updates: Partial<Pick<User, 'displayName'>>,
  ): Promise<User | null> {
    const user = await this.userRepository.update(id, updates);

    if (user) {
      // Invalidate cache
      await this.cacheManager.del(`users:${id}`);
      // Also invalidate list caches (simplified, in real app might need more sophisticated invalidation)
      await this.cacheManager.del(`users:list:*`);
    }

    return user;
  }
}
