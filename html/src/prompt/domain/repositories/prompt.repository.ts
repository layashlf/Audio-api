import { Prompt } from '../entities/prompt';

export abstract class PromptRepository {
  abstract findById(id: string): Promise<Prompt | null>;
  abstract findByUserId(
    userId: string,
    limit?: number,
    offset?: number,
    filters?: { status?: string },
  ): Promise<Prompt[]>;
  abstract countByUserId(
    userId: string,
    filters?: { status?: string },
  ): Promise<number>;
  abstract findPending(): Promise<Prompt[]>;
  abstract create(
    prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Prompt>;
  abstract update(id: string, prompt: Partial<Prompt>): Promise<Prompt>;
}
