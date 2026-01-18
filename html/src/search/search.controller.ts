import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UnifiedSearchUseCase } from './application/use-cases/unified-search.use-case';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly unifiedSearchUseCase: UnifiedSearchUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Unified search across users and audios' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum results to return',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Pagination cursor',
  })
  async search(
    @Query('q') query: string,
    @Query('limit') limit: number = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.unifiedSearchUseCase.execute(query, limit, cursor);
  }
}
