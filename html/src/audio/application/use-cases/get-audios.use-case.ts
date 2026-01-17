import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { Audio } from '../../domain/entities/audio';

@Injectable()
export class GetAudiosUseCase {
  constructor(
    @Inject('AudioRepository')
    private readonly audioRepository: AudioRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ audios: Audio[]; total: number }> {
    const cacheKey = `audios:list:${limit}:${offset}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<{
      audios: Audio[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const [audios, total] = await Promise.all([
      this.audioRepository.findAll(limit, offset),
      this.audioRepository.count(),
    ]);

    const result = { audios, total };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }
}
