import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { PromptRepository } from '../../domain/repositories/prompt.repository';
import { QueueService } from '../../../queue/queue.service';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    private promptRepo: PromptRepository,
    private queueService: QueueService,
  ) {}

  onModuleInit() {
    cron.schedule('*/30 * * * * *', async () => {
      const pending = await this.promptRepo.findPending();
      for (const prompt of pending) {
        await this.queueService.addAudioGenerationJob(
          prompt.id,
          prompt.priority,
        );
      }
    });
  }
}
