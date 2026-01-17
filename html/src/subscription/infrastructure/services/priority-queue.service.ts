import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Subscription } from '../../domain/entities/subscription';

@Injectable()
export class PriorityQueueService {
  constructor(
    @InjectQueue('prompt-processing') private readonly promptQueue: Queue,
  ) {}

  async addPromptToQueue(
    promptId: string,
    subscription: Subscription,
  ): Promise<void> {
    await this.promptQueue.add(
      'process-prompt',
      { promptId },
      {
        priority: subscription.getPriority(),
        delay: 0, // No delay for now
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  // This will be used later when implementing the worker
  async getQueueStats() {
    const waiting = await this.promptQueue.getWaiting();
    const active = await this.promptQueue.getActive();
    const completed = await this.promptQueue.getCompleted();
    const failed = await this.promptQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }
}
