import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { Audio } from '../../domain/entities/audio';

@Injectable()
export class GetAudioByIdUseCase {
  constructor(
    @Inject('AudioRepository')
    private readonly audioRepository: AudioRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(id: string): Promise<Audio | null> {
    const cacheKey = `audios:${id}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<Audio>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const audio = await this.audioRepository.findById(id);

    if (audio) {
      // Cache for 60 seconds
      await this.cacheManager.set(cacheKey, audio, 60000);
    }

    return audio;
  }
}
