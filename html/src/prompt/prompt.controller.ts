import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guard/access-token.guard';
import { CreatePromptUseCase } from './application/use-cases/create-prompt.use-case';
import { GetPromptsUseCase } from './application/use-cases/get-prompts.use-case';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { PromptResponseDto } from './dto/prompt-response.dto';
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
  async getMyPrompts(@Request() req): Promise<PromptResponseDto[]> {
    const prompts = await this.getPromptsUseCase.execute(req.user.id);
    return prompts.map((p) =>
      plainToClass(PromptResponseDto, p, { excludeExtraneousValues: true }),
    );
  }
}
