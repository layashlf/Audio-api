import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { Audio } from '../../domain/entities/audio';

@Injectable()
export class UpdateAudioUseCase {
  constructor(
    @Inject('AudioRepository')
    private readonly audioRepository: AudioRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(
    id: string,
    updates: Partial<Pick<Audio, 'title'>>,
  ): Promise<Audio | null> {
    const audio = await this.audioRepository.update(id, updates);

    if (audio) {
      // Invalidate cache
      await this.cacheManager.del(`audios:${id}`);
      // Also invalidate list caches (simplified)
      await this.cacheManager.del(`audios:list:*`);
    }

    return audio;
  }
}
