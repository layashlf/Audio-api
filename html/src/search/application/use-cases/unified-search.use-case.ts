import { Inject, Injectable } from '@nestjs/common';
import { SearchRepository } from '../../domain/repositories/search.repository';

@Injectable()
export class UnifiedSearchUseCase {
  constructor(
    @Inject('SearchRepository')
    private readonly searchRepository: SearchRepository,
  ) {}

  async execute(query: string, limit: number = 20, cursor?: string) {
    return this.searchRepository.search(query, limit, cursor);
  }
}
