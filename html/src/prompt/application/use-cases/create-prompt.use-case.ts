import { Injectable, Inject } from '@nestjs/common';
import { PromptRepository } from '../../domain/repositories/prompt.repository';
import { Prompt, PromptStatus } from '../../domain/entities/prompt';
import { SubscriptionRepository } from '../../../subscription/domain/repositories/subscription.repository';

@Injectable()
export class CreatePromptUseCase {
  constructor(
    private promptRepo: PromptRepository,
    @Inject('SubscriptionRepository')
    private subscriptionRepo: SubscriptionRepository,
  ) {}

  async execute(userId: string, text: string): Promise<Prompt> {
    if (!text || text.trim() === '') {
      throw new Error('Prompt text cannot be empty');
    }
    if (!userId || userId.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    const subscription = await this.subscriptionRepo.findByUserId(userId);
    const priority = subscription?.tier === 'PAID' ? 10 : 0;
    return this.promptRepo.create({
      text,
      status: PromptStatus.PENDING,
      priority,
      userId,
    });
  }
}
