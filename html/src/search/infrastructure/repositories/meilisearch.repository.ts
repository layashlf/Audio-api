import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearchService } from '../services/meilisearch.service';
import { SearchRepository } from '../../domain/repositories/search.repository';
import { SearchResult } from '../../domain/entities/search-result';
import { UserEntity } from 'src/authentication/entities/userEntity';
import { Audio } from 'src/audio/domain';

@Injectable()
export class MeiliSearchRepository implements SearchRepository {
  private readonly logger = new Logger(MeiliSearchRepository.name);

  constructor(private readonly meiliService: MeiliSearchService) { }

  // Unified Search across multiple indexes using Meilisearch Federated Search.
  // Returns separate results for users and audio with individual pagination.

  async search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{
    users: { data: any[]; meta: { next_cursor?: string | null } };
    audio: { data: any[]; meta: { next_cursor?: string | null } };
  }> {
    const client = this.meiliService.getClient();

    // In Meilisearch, pagination is often offset-based.
    // We treat the cursor as the offset value.
    const offset = cursor ? parseInt(cursor, 10) : 0;

    try {
      // Perform separate searches for users and audio
      const [userResults, audioResults] = await Promise.all([
        client.index('users').search(query, {
          limit: limit,
          offset: offset,
          attributesToRetrieve: ['id', 'email', 'displayName'],
        }),
        client.index('audio_files').search(query, {
          limit: limit,
          offset: offset,
          attributesToRetrieve: ['id', 'title', 'userId', 'url'],
        }),
      ]);

      // Process user results
      const usersData = userResults.hits.map((hit) => ({
        id: hit.id,
        email: hit.email,
        displayName: hit.displayName,
      }));

      // Process audio results
      const audioData = audioResults.hits.map((hit) => ({
        id: hit.id,
        title: hit.title,
        userId: hit.userId,
        url: hit.url,
      }));

      // Calculate next cursors
      const usersNextCursor =
        userResults.hits.length >= limit
          ? (offset + limit).toString()
          : null;
      const audioNextCursor =
        audioResults.hits.length >= limit
          ? (offset + limit).toString()
          : null;

      return {
        users: {
          data: usersData,
          meta: {
            next_cursor: usersNextCursor,
          },
        },
        audio: {
          data: audioData,
          meta: {
            next_cursor: audioNextCursor,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Search failed for query "${query}": ${error.message}`);
      return {
        users: { data: [], meta: {} },
        audio: { data: [], meta: {} },
      };
    }
  }

  // Indexing methods map Domain Entities to Index Documents.
  // This prevents Infrastructure leakage into the Use Cases.

  async indexUser(user: UserEntity): Promise<void> {
    const index = this.meiliService.getClient().index('users');
    await index.addDocuments([
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.getTime(), // Numeric dates for sorting if needed
      },
    ]);
  }

  async indexAudio(audio: Audio): Promise<void> {
    const index = this.meiliService.getClient().index('audios');
    await index.addDocuments([
      {
        id: audio.id,
        title: audio.title,
        userId: audio.userId,
        url: audio.url,
        createdAt: audio.createdAt.getTime(),
      },
    ]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.meiliService.getClient().index('users').deleteDocument(id);
  }

  async deleteAudio(id: string): Promise<void> {
    await this.meiliService.getClient().index('audios').deleteDocument(id);
  }
}
