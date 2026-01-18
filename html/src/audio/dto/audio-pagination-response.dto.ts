import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../user/dto/pagination-response.dto';
import { AudioResponseDto } from './audio-response.dto';

export class PaginatedAudiosResponseDto {
  @ApiProperty({
    type: [AudioResponseDto],
    description: 'Array of audio records',
  })
  data: AudioResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  pagination: PaginationMetaDto;
}
