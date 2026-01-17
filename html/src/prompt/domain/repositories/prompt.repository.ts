import { Prompt } from '../entities/prompt';

export abstract class PromptRepository {
  abstract findById(id: string): Promise<Prompt | null>;
  abstract findByUserId(userId: string): Promise<Prompt[]>;
  abstract findPending(): Promise<Prompt[]>;
  abstract create(
    prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Prompt>;
  abstract update(id: string, prompt: Partial<Prompt>): Promise<Prompt>;
}
