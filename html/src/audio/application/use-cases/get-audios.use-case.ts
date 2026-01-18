import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { Audio } from '../../domain/entities/audio';
import { PaginationMetaDto } from '../../../user/dto/pagination-response.dto';

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
  ): Promise<{
    audios: Audio[];
    total: number;
    pagination: PaginationMetaDto;
  }> {
    const cacheKey = `audios:list:${limit}:${offset}`;

    // Try to get from cache
    const cached = await this.cacheManager.get<{
      audios: Audio[];
      total: number;
      pagination: PaginationMetaDto;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    const [audios, total] = await Promise.all([
      this.audioRepository.findAll(limit, offset),
      this.audioRepository.count(),
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

    const result = { audios, total, pagination };

    // Cache for 60 seconds
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }
}
