import { SearchResult } from '../entities/search-result';

export interface SearchRepository {
  search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{
    users: { data: any[]; meta: { next_cursor?: string | null } };
    audio: { data: any[]; meta: { next_cursor?: string | null } };
  }>;

  indexUser(user: {
    id: string;
    email: string;
    displayName?: string;
    createdAt: Date;
  }): Promise<void>;
  indexAudio(audio: {
    id: string;
    title: string;
    userId: string;
    promptId: string;
    url: string;
    createdAt: Date;
  }): Promise<void>;
  deleteUser(id: string): Promise<void>;
  deleteAudio(id: string): Promise<void>;
}
