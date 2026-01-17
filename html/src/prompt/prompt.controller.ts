import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guard/access-token.guard';
import { CreatePromptUseCase } from './application/use-cases/create-prompt.use-case';
import { GetPromptsUseCase } from './application/use-cases/get-prompts.use-case';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { PromptResponseDto } from './dto/prompt-response.dto';
import { PaginatedPromptsResponseDto } from './dto/prompt-pagination-response.dto';
import { plainToClass } from 'class-transformer';

@ApiTags('Prompts')
@Controller('prompts')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PromptController {
  constructor(
    private createPromptUseCase: CreatePromptUseCase,
    private getPromptsUseCase: GetPromptsUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreatePromptDto,
    @Request() req,
  ): Promise<PromptResponseDto> {
    const prompt = await this.createPromptUseCase.execute(
      req.user.sub,
      dto.text,
    );
    return plainToClass(PromptResponseDto, prompt, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get user prompts with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Items to skip (alternative to page)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED'],
    description: 'Filter by prompt status',
  })
  @ApiResponse({
    status: 200,
    description: 'Prompts retrieved successfully',
    type: PaginatedPromptsResponseDto,
  })
  async getMyPrompts(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('offset') offset?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedPromptsResponseDto> {
    // Calculate offset from page if provided
    if (page && page > 0) {
      offset = (page - 1) * limit;
    } else if (!offset) {
      offset = 0;
    }

    const filters = status ? { status } : undefined;

    const result = await this.getPromptsUseCase.execute(
      req.user.sub,
      limit,
      offset,
      filters,
    );

    return {
      data: result.prompts.map((p) =>
        plainToClass(PromptResponseDto, p, { excludeExtraneousValues: true }),
      ),
      pagination: result.pagination,
    };
  }
}
