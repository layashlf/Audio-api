import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedSearchUseCase } from '../unified-search.use-case';
import { SearchRepository } from '../../../domain/repositories/search.repository';

describe('UnifiedSearchUseCase', () => {
  let useCase: UnifiedSearchUseCase;
  let searchRepository: jest.Mocked<SearchRepository>;

  beforeEach(async () => {
    const mockSearchRepository = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnifiedSearchUseCase,
        {
          provide: 'SearchRepository',
          useValue: mockSearchRepository,
        },
      ],
    }).compile();

    useCase = module.get<UnifiedSearchUseCase>(UnifiedSearchUseCase);
    searchRepository = module.get('SearchRepository');
  });

  it('should search with default parameters', async () => {
    // Arrange
    const query = 'jazz';
    const mockResults = {
      results: [],
      nextCursor: undefined,
    };

    searchRepository.search.mockResolvedValue(mockResults);

    // Act
    const result = await useCase.execute(query);

    // Assert
    expect(searchRepository.search).toHaveBeenCalledWith(query, 20, undefined);
    expect(result).toEqual(mockResults);
  });

  it('should search with custom limit and cursor', async () => {
    // Arrange
    const query = 'rock';
    const limit = 10;
    const cursor = 'cursor123';
    const mockResults = {
      results: [],
      nextCursor: 'next123',
    };

    searchRepository.search.mockResolvedValue(mockResults);

    // Act
    const result = await useCase.execute(query, limit, cursor);

    // Assert
    expect(searchRepository.search).toHaveBeenCalledWith(query, limit, cursor);
    expect(result).toEqual(mockResults);
  });

  it('should handle empty search results', async () => {
    // Arrange
    const query = 'nonexistent';
    const mockResults = {
      results: [],
      nextCursor: undefined,
    };

    searchRepository.search.mockResolvedValue(mockResults);

    // Act
    const result = await useCase.execute(query);

    // Assert
    expect(result.results).toHaveLength(0);
    expect(result.nextCursor).toBeUndefined();
  });

  it('should handle search repository errors', async () => {
    // Arrange
    const query = 'error';
    searchRepository.search.mockRejectedValue(
      new Error('Search service unavailable'),
    );

    // Act & Assert
    await expect(useCase.execute(query)).rejects.toThrow(
      'Search service unavailable',
    );
  });
});
