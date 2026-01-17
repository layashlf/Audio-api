import { Injectable } from '@nestjs/common';
import { MeiliSearchService } from '../services/meilisearch.service';
import { SearchRepository } from '../../domain/repositories/search.repository';
import { SearchResult } from '../../domain/entities/search-result';

@Injectable()
export class MeiliSearchRepository implements SearchRepository {
  constructor(private readonly meiliService: MeiliSearchService) {}

  async search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{ results: SearchResult[]; nextCursor?: string }> {
    const client = this.meiliService.getClient();

    // Search in users index
    const userIndex = client.index('users');
    const audioIndex = client.index('audios');

    // Perform searches with offset
    const offset = cursor ? parseInt(cursor) : 0;

    const [userResults, audioResults] = await Promise.all([
      userIndex.search(query, { limit: limit * 2, offset }), // fetch more to combine
      audioIndex.search(query, { limit: limit * 2, offset }),
    ]);

    // Combine and weight
    const results: SearchResult[] = [];

    // Weights: users 1.0, audios 0.8
    userResults.hits.forEach((hit) => {
      results.push({
        id: hit.id as string,
        type: 'user',
        data: hit,
        score: (hit._rankingScore as number) * 1.0,
      });
    });

    audioResults.hits.forEach((hit) => {
      results.push({
        id: hit.id as string,
        type: 'audio',
        data: hit,
        score: (hit._rankingScore as number) * 0.8,
      });
    });

    // Sort by score desc
    results.sort((a, b) => b.score - a.score);

    // Take top limit
    const topResults = results.slice(0, limit);

    // For next cursor, if there are more results, set next offset
    const hasMore =
      results.length > limit ||
      userResults.hits.length === limit * 2 ||
      audioResults.hits.length === limit * 2;
    const nextCursor = hasMore ? (offset + limit).toString() : undefined;

    return { results: topResults, nextCursor };
  }
}
