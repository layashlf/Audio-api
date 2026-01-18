import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guard/access-token.guard';
import { GetAudiosUseCase } from './application/use-cases/get-audios.use-case';
import { GetAudioByIdUseCase } from './application/use-cases/get-audio-by-id.use-case';
import { UpdateAudioUseCase } from './application/use-cases/update-audio.use-case';
import { AudioResponseDto } from './dto/audio-response.dto';
import { PaginatedAudiosResponseDto } from './dto/audio-pagination-response.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { Audio } from './domain/entities/audio';

@ApiTags('Audio')
@ApiBearerAuth()
@Controller('audio')
@UseGuards(AccessTokenGuard)
export class AudioController {
  constructor(
    private readonly getAudiosUseCase: GetAudiosUseCase,
    private readonly getAudioByIdUseCase: GetAudioByIdUseCase,
    private readonly updateAudioUseCase: UpdateAudioUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all audio files with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Audio files retrieved successfully',
    type: PaginatedAudiosResponseDto,
  })
  async getAudios(
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('offset') offset?: number,
  ): Promise<PaginatedAudiosResponseDto> {
    // Calculate offset from page if provided
    if (page && page > 0) {
      offset = (page - 1) * limit;
    } else if (!offset) {
      offset = 0;
    }

    const result = await this.getAudiosUseCase.execute(limit, offset);
    return {
      data: result.audios.map(this.mapToDto),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio file by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audio file retrieved successfully',
    type: AudioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Audio file not found' })
  async getAudioById(
    @Param('id') id: string,
  ): Promise<AudioResponseDto | null> {
    const audio = await this.getAudioByIdUseCase.execute(id);
    return audio ? this.mapToDto(audio) : null;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update audio file by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audio file updated successfully',
    type: AudioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Audio file not found' })
  async updateAudio(
    @Param('id') id: string,
    @Body() updateAudioDto: UpdateAudioDto,
  ): Promise<AudioResponseDto | null> {
    const audio = await this.updateAudioUseCase.execute(id, updateAudioDto);
    return audio ? this.mapToDto(audio) : null;
  }

  private mapToDto(audio: Audio): AudioResponseDto {
    return {
      id: audio.id,
      title: audio.title,
      url: audio.url,
      fileSize: audio.fileSize,
      duration: audio.duration,
    };
  }
}
