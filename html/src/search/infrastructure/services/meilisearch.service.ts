import { Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class MeiliSearchService {
  private client: MeiliSearch;

  constructor() {
    this.client = new MeiliSearch({
      host: process.env.MEILI_HOST || 'http://meilisearch:7700',
      apiKey: process.env.MEILI_MASTER_KEY || 'masterKey',
    });
  }

  getClient() {
    return this.client;
  }
}
