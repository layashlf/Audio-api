import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { AudioGenerationProcessor } from './audio-generation.processor';
import { CronService } from '../prompt/infrastructure/services/cron.service';
import { PromptModule } from '../prompt/prompt.module';
import { AudioModule } from '../audio/audio.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audio-generation',
    }),
    PromptModule,
    AudioModule,
    WebsocketModule,
  ],
  providers: [QueueService, AudioGenerationProcessor, CronService],
  exports: [QueueService],
})
export class QueueModule {}
