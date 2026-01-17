import { Controller, Get, Query } from '@nestjs/common';
import { UnifiedSearchUseCase } from './application/use-cases/unified-search.use-case';

@Controller('search')
export class SearchController {
  constructor(private readonly unifiedSearchUseCase: UnifiedSearchUseCase) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.unifiedSearchUseCase.execute(query, limit, cursor);
  }
}
