import { User } from '../entities/user';

export interface UserRepository {
  findAll(limit?: number, offset?: number): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  count(): Promise<number>;
}
