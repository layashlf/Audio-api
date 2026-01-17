import { Audio } from '../entities/audio';

export interface AudioRepository {
  findAll(limit?: number, offset?: number): Promise<Audio[]>;
  findById(id: string): Promise<Audio | null>;
  update(id: string, audio: Partial<Audio>): Promise<Audio | null>;
  count(): Promise<number>;
}
