export interface SearchResult {
  id: string;
  type: 'user' | 'audio';
  data: any;
  score: number;
}
