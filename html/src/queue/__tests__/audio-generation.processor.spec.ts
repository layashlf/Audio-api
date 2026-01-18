import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { AudioGenerationProcessor } from '../audio-generation.processor';
import { AudioRepository } from '../../audio/domain/repositories/audio.repository';
import { PromptRepository } from '../../prompt/domain/repositories/prompt.repository';
import { SearchRepository } from '../../search/domain/repositories/search.repository';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { PromptStatus } from '../../prompt/domain/entities/prompt';
import { Audio } from '../../audio/domain/entities/audio';

describe('AudioGenerationProcessor', () => {
  let processor: AudioGenerationProcessor;
  let audioRepository: jest.Mocked<AudioRepository>;
  let promptRepository: jest.Mocked<PromptRepository>;
  let searchRepository: jest.Mocked<SearchRepository>;
  let websocketGateway: jest.Mocked<WebsocketGateway>;

  beforeEach(async () => {
    const mockAudioRepository = {
      create: jest.fn(),
    };

    const mockPromptRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockSearchRepository = {
      indexAudio: jest.fn(),
      search: jest.fn(),
      indexUser: jest.fn(),
    };

    const mockWebSocketGateway = {
      notifyUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioGenerationProcessor,
        {
          provide: 'AudioRepository',
          useValue: mockAudioRepository,
        },
        {
          provide: 'PromptRepository',
          useValue: mockPromptRepository,
        },
        {
          provide: 'SearchRepository',
          useValue: mockSearchRepository,
        },
        {
          provide: WebsocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    processor = module.get<AudioGenerationProcessor>(AudioGenerationProcessor);
    audioRepository = module.get('AudioRepository');
    promptRepository = module.get('PromptRepository');
    searchRepository = module.get('SearchRepository');
    websocketGateway = module.get(WebsocketGateway);
  });

  it('should process audio generation job successfully', async () => {
    // Arrange
    const jobData = {
      promptId: 'prompt-123',
    };

    const mockPrompt = {
      id: 'prompt-123',
      text: 'Create a jazz melody',
      status: PromptStatus.PENDING,
      priority: 0,
      userId: 'user-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAudio = new Audio(
      'audio-789',
      'Jazz Melody',
      'https://example.com/audio/prompt-123.mp3',
      'prompt-123',
      'user-456',
      1024000,
      180.5,
      new Date(),
      new Date(),
    );

    promptRepository.findById.mockResolvedValue(mockPrompt);
    promptRepository.update.mockResolvedValue(mockPrompt);
    audioRepository.create.mockResolvedValue(mockAudio);
    searchRepository.indexAudio.mockResolvedValue(undefined);

    // Act
    const job = { data: jobData } as Job<{ promptId: string }>;
    const result = await processor.process(job);

    // Assert
    expect(promptRepository.findById).toHaveBeenCalledWith('prompt-123');
    expect(promptRepository.update).toHaveBeenCalledWith('prompt-123', {
      status: PromptStatus.PROCESSING,
    });
    expect(audioRepository.create).toHaveBeenCalled();
    expect(promptRepository.update).toHaveBeenCalledWith('prompt-123', {
      status: PromptStatus.COMPLETED,
      audioId: 'audio-789',
    });
    expect(websocketGateway.notifyUser).toHaveBeenCalledWith('user-456', {
      type: 'prompt-completed',
      promptId: 'prompt-123',
      audio: {
        id: 'audio-789',
        title: 'Jazz Melody',
        url: 'https://example.com/audio/prompt-123.mp3',
      },
    });
    expect(result).toBeUndefined();
  });

  it('should handle prompt not found', async () => {
    // Arrange
    const jobData = {
      promptId: 'nonexistent-prompt',
    };

    promptRepository.findById.mockResolvedValue(null);

    // Act
    const job = { data: jobData } as Job<{ promptId: string }>;
    const result = await processor.process(job);

    // Assert
    expect(result).toBeUndefined();
    expect(promptRepository.update).not.toHaveBeenCalled();
    expect(audioRepository.create).not.toHaveBeenCalled();
  });

  it('should handle audio generation failure', async () => {
    // Arrange
    const jobData = {
      promptId: 'prompt-123',
    };

    const mockPrompt = {
      id: 'prompt-123',
      text: 'Create a jazz melody',
      status: PromptStatus.PENDING,
      priority: 0,
      userId: 'user-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    promptRepository.findById.mockResolvedValue(mockPrompt);
    audioRepository.create.mockRejectedValue(
      new Error('AI service unavailable'),
    );

    // Act & Assert
    const job = { data: jobData } as Job<{ promptId: string }>;
    await expect(processor.process(job)).rejects.toThrow(
      'AI service unavailable',
    );

    // Should update status to PROCESSING but not to COMPLETED
    expect(promptRepository.update).toHaveBeenCalledWith('prompt-123', {
      status: PromptStatus.PROCESSING,
    });
    expect(promptRepository.update).not.toHaveBeenCalledWith('prompt-123', {
      status: PromptStatus.COMPLETED,
      audioId: expect.any(String),
    });
  });

  it('should generate appropriate audio title from prompt text', async () => {
    // Arrange
    const jobData = {
      promptId: 'prompt-123',
    };

    const mockPrompt = {
      id: 'prompt-123',
      text: 'Create a beautiful piano sonata in C major',
      status: PromptStatus.PENDING,
      priority: 0,
      userId: 'user-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAudio = new Audio(
      'audio-789',
      'Beautiful Piano Sonata In C Major',
      'https://example.com/audio/prompt-123.mp3',
      'prompt-123',
      'user-456',
      2048000,
      300.0,
      new Date(),
      new Date(),
    );

    promptRepository.findById.mockResolvedValue(mockPrompt);
    promptRepository.update.mockResolvedValue(mockPrompt);
    audioRepository.create.mockResolvedValue(mockAudio);

    // Act
    const job = { data: jobData } as Job<{ promptId: string }>;
    await processor.process(job);

    // Assert
    expect(audioRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Piano Sonata'),
        promptId: 'prompt-123',
        userId: 'user-456',
      }),
    );
  });

  it('should handle WebSocket notification failure gracefully', async () => {
    // Arrange
    const jobData = {
      promptId: 'prompt-123',
    };

    const mockPrompt = {
      id: 'prompt-123',
      text: 'Create a melody',
      status: PromptStatus.PENDING,
      priority: 0,
      userId: 'user-456',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAudio = new Audio(
      'audio-789',
      'Generated Melody',
      'https://example.com/audio/melody.mp3',
      'prompt-123',
      'user-456',
      512000,
      120.0,
      new Date(),
      new Date(),
    );

    promptRepository.findById.mockResolvedValue(mockPrompt);
    promptRepository.update.mockResolvedValue(mockPrompt);
    audioRepository.create.mockResolvedValue(mockAudio);
    websocketGateway.notifyUser.mockImplementation(() => {
      throw new Error('WebSocket error');
    });

    // Act & Assert - Should not throw, WebSocket failure shouldn't fail the job
    const job = { data: jobData } as Job<{ promptId: string }>;
    await expect(processor.process(job)).resolves.toBeUndefined();

    // Should still complete successfully despite WebSocket failure
    expect(promptRepository.update).toHaveBeenCalledWith('prompt-123', {
      status: PromptStatus.COMPLETED,
      audioId: 'audio-789',
    });
  });
});
