import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../user/dto/pagination-response.dto';
import { PromptResponseDto } from './prompt-response.dto';

export class PaginatedPromptsResponseDto {
  @ApiProperty({
    type: [PromptResponseDto],
    description: 'Array of prompt records',
  })
  data: PromptResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  pagination: PaginationMetaDto;
}
