import { Test, TestingModule } from '@nestjs/testing';
import { CreatePromptUseCase } from '../create-prompt.use-case';
import { PromptRepository } from '../../../domain/repositories/prompt.repository';
import { Prompt, PromptStatus } from '../../../domain/entities/prompt';
import { SubscriptionRepository } from '../../../../subscription/domain/repositories/subscription.repository';

describe('CreatePromptUseCase', () => {
  let useCase: CreatePromptUseCase;
  let promptRepository: jest.Mocked<PromptRepository>;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;

  beforeEach(async () => {
    const mockPromptRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findByUserId: jest.fn(),
    };

    const mockSubscriptionRepository = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePromptUseCase,
        {
          provide: 'PromptRepository',
          useValue: mockPromptRepository,
        },
        {
          provide: 'SubscriptionRepository',
          useValue: mockSubscriptionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreatePromptUseCase>(CreatePromptUseCase);
    promptRepository = module.get('PromptRepository');
    subscriptionRepository = module.get('SubscriptionRepository');
  });

  it('should create prompt successfully', async () => {
    // Arrange
    const createData = {
      text: 'Create a jazz melody',
      userId: 'user-id',
    };

    const mockPrompt = new Prompt(
      'prompt-id',
      createData.text,
      PromptStatus.PENDING,
      0,
      createData.userId,
      new Date(),
      new Date(),
    );
    promptRepository.create.mockResolvedValue(mockPrompt);
    subscriptionRepository.findByUserId.mockResolvedValue(null);

    // Act
    const result = await useCase.execute(createData.userId, createData.text);

    // Assert
    expect(promptRepository.create).toHaveBeenCalledWith({
      text: createData.text,
      userId: createData.userId,
      status: PromptStatus.PENDING,
      priority: 0,
    });
    expect(result).toEqual(mockPrompt);
  });

  it('should validate prompt text is not empty', async () => {
    // Arrange
    const createData = {
      text: '',
      userId: 'user-id',
    };

    subscriptionRepository.findByUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(
      useCase.execute(createData.userId, createData.text),
    ).rejects.toThrow();
  });

  it('should validate userId is provided', async () => {
    // Arrange
    const createData = {
      text: 'Create a jazz melody',
      userId: '',
    };

    subscriptionRepository.findByUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(
      useCase.execute(createData.userId, createData.text),
    ).rejects.toThrow();
  });
});
