import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PromptRepository } from '../prompt/domain/repositories/prompt.repository';
import { AudioRepository } from '../audio/domain/repositories/audio.repository';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { PromptStatus } from '../prompt/domain/entities/prompt';

@Processor('audio-generation')
@Injectable()
export class AudioGenerationProcessor extends WorkerHost {
  constructor(
    @Inject('PromptRepository') private promptRepo: PromptRepository,
    @Inject('AudioRepository') private audioRepo: AudioRepository,
    private websocketGateway: WebsocketGateway,
  ) {
    super();
  }

  async process(job: Job<{ promptId: string }>) {
    const { promptId } = job.data;
    const prompt = await this.promptRepo.findById(promptId);
    if (!prompt) return;

    // update status to PROCESSING
    await this.promptRepo.update(promptId, { status: PromptStatus.PROCESSING });

    // create audio
    const title = this.generateTitleFromPrompt(prompt.text);
    const audio = await this.audioRepo.create({
      title,
      url: `https://example.com/audio/${promptId}.mp3`,
      promptId,
      userId: prompt.userId,
      fileSize: Math.floor(Math.random() * 1000000),
      duration: Math.floor(Math.random() * 300) + 30,
    });

    // update prompt
    await this.promptRepo.update(promptId, {
      status: PromptStatus.COMPLETED,
      audioId: audio.id,
    });

    // notify
    try {
      this.websocketGateway.notifyUser(prompt.userId, {
        type: 'prompt-completed',
        promptId,
        audio: {
          id: audio.id,
          title: audio.title,
          url: audio.url,
        },
      });
    } catch (error) {
      // Log error but don't fail the job
      console.error('Failed to send WebSocket notification:', error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Job ${job.id} failed: ${err.message}`);
  }

  private generateTitleFromPrompt(text: string): string {
    // Simple title generation: remove "Create a" and capitalize words
    let title = text.replace(/^create\s+a\s+/i, '').replace(/^create\s+/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);
    // Capitalize words
    title = title.replace(/\b\w/g, (l) => l.toUpperCase());
    return title;
  }
}
