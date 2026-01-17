import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('audio-generation') private queue: Queue) {}

  async addAudioGenerationJob(promptId: string, priority: number) {
    await this.queue.add('generate-audio', { promptId }, { priority });
  }
}
