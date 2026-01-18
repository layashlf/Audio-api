import { Injectable, Logger } from '@nestjs/common';
import { MeiliSearchService } from '../services/meilisearch.service';
import { SearchRepository } from '../../domain/repositories/search.repository';
import { SearchResult } from '../../domain/entities/search-result';
import { UserEntity } from 'src/authentication/entities/userEntity';
import { Audio } from 'src/audio/domain';

@Injectable()
export class MeiliSearchRepository implements SearchRepository {
  private readonly logger = new Logger(MeiliSearchRepository.name);

  constructor(private readonly meiliService: MeiliSearchService) {}

  // Unified Search across multiple indexes using Meilisearch Federated Search.
  // Implements manual weighting to prioritize User results over Audio.

  async search(
    query: string,
    limit: number,
    cursor?: string,
  ): Promise<{ results: SearchResult[]; nextCursor?: string }> {
    const client = this.meiliService.getClient();

    // In Meilisearch, pagination is often offset-based.
    // We treat the cursor as the offset value.
    const offset = cursor ? parseInt(cursor, 10) : 0;

    try {
      // Use Multi-Search to hit both indexes in a single network request
      const response = await client.multiSearch({
        queries: [
          {
            indexUid: 'users',
            q: query,
            limit: limit,
            offset: offset,
            showRankingScore: true, // Required to get the hit._rankingScore
            attributesToRetrieve: ['id', 'email', 'displayName'],
          },
          {
            indexUid: 'audio_files',
            q: query,
            limit: limit,
            offset: offset,
            showRankingScore: true,
            attributesToRetrieve: ['id', 'title', 'userId', 'url'],
          },
        ],
      });

      const combinedResults: SearchResult[] = [];

      response.results.forEach((indexResult) => {
        const type = indexResult.indexUid === 'users' ? 'user' : 'audio';

        // Weighting Logic: Users are slightly more important than Audio in global search
        const weight = type === 'user' ? 1.0 : 0.8;

        indexResult.hits.forEach((hit) => {
          const { _rankingScore, ...cleanData } = hit;
          combinedResults.push({
            id: hit.id as string,
            type: type,
            data: cleanData,
            // Normalize score based on Meilisearch ranking and our custom weight
            score: (hit._rankingScore || 0) * weight,
          });
        });
      });

      // Sort combined results by the final weighted score
      combinedResults.sort((a, b) => b.score - a.score);

      // Slice to the requested limit
      const topResults = combinedResults.slice(0, limit);

      // Determine if more results exist across either index
      const totalHits = response.results.reduce(
        (sum, res) => sum + (res.hits.length || 0),
        0,
      );
      const hasMore = totalHits >= limit;
      const nextCursor = hasMore ? (offset + limit).toString() : undefined;

      return {
        results: topResults,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Search failed for query "${query}": ${error.message}`);
      return { results: [], nextCursor: undefined };
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
