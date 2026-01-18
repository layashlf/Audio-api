import { SearchResult } from '../entities/search-result';

export interface SearchRepository {
  search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{ results: SearchResult[]; nextCursor?: string }>;

  indexUser(user: {
    id: string;
    email: string;
    displayName?: string;
  }): Promise<void>;
  indexAudio(audio: {
    id: string;
    title: string;
    userId: string;
    promptId: string;
  }): Promise<void>;
  deleteUser(id: string): Promise<void>;
  deleteAudio(id: string): Promise<void>;
}
