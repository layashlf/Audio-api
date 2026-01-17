import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { MeiliSearchRepository } from './infrastructure/repositories/meilisearch.repository';
import { UnifiedSearchUseCase } from './application/use-cases/unified-search.use-case';
import { MeiliSearchService } from './infrastructure/services/meilisearch.service';

@Module({
  controllers: [SearchController],
  providers: [
    {
      provide: 'SearchRepository',
      useClass: MeiliSearchRepository,
    },
    MeiliSearchService,
    UnifiedSearchUseCase,
  ],
  exports: [],
})
export class SearchModule {}
