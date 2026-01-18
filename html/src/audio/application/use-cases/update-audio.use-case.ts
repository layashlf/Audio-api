import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { SearchRepository } from '../../../search/domain/repositories/search.repository';
import { Audio } from '../../domain/entities/audio';

@Injectable()
export class UpdateAudioUseCase {
  constructor(
    @Inject('AudioRepository')
    private readonly audioRepository: AudioRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('SearchRepository')
    private readonly searchRepository: SearchRepository,
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
      // Re-index audio for search
      await this.searchRepository.indexAudio({
        id: audio.id,
        title: audio.title,
        userId: audio.userId,
        promptId: audio.promptId,
        url: audio.url,
        createdAt: audio.createdAt,
      });
    }

    return audio;
  }
}
