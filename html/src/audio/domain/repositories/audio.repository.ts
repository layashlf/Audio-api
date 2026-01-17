import { Audio } from '../entities/audio';

export interface AudioRepository {
  create(data: {
    title: string;
    url: string;
    promptId: string;
    userId: string;
    fileSize?: number;
    duration?: number;
  }): Promise<Audio>;
  findAll(limit?: number, offset?: number): Promise<Audio[]>;
  findById(id: string): Promise<Audio | null>;
  update(id: string, audio: Partial<Audio>): Promise<Audio | null>;
  count(): Promise<number>;
}
