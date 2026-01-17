import { Injectable, Inject } from '@nestjs/common';
import { PromptRepository } from '../../domain/repositories/prompt.repository';
import { Prompt } from '../../domain/entities/prompt';
import { PaginationMetaDto } from '../../../user/dto/pagination-response.dto';

@Injectable()
export class GetPromptsUseCase {
  constructor(
    @Inject('PromptRepository')
    private promptRepo: PromptRepository,
  ) {}

  async execute(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    filters?: { status?: string },
  ): Promise<{
    prompts: Prompt[];
    total: number;
    pagination: PaginationMetaDto;
  }> {
    const [prompts, total] = await Promise.all([
      this.promptRepo.findByUserId(userId, limit, offset, filters),
      this.promptRepo.countByUserId(userId, filters),
    ]);

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

    return { prompts, total, pagination };
  }
}
