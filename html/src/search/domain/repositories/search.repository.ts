import { SearchResult } from '../entities/search-result';

export interface SearchRepository {
  search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{ results: SearchResult[]; nextCursor?: string }>;
}
