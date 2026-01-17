import { Injectable, Inject } from '@nestjs/common';
import { PromptRepository } from '../../domain/repositories/prompt.repository';
import { Prompt } from '../../domain/entities/prompt';

@Injectable()
export class GetPromptsUseCase {
  constructor(
    @Inject('PromptRepository')
    private promptRepo: PromptRepository,
  ) {}

  async execute(userId: string): Promise<Prompt[]> {
    return this.promptRepo.findByUserId(userId);
  }
}
