import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of records' })
  total_records: number;

  @ApiProperty({ description: 'Current page number (1-based)' })
  current_page: number;

  @ApiProperty({ description: 'Total number of pages' })
  total_pages: number;

  @ApiProperty({ description: 'Next page number, null if no next page' })
  next_page: number | null;

  @ApiProperty({
    description: 'Previous page number, null if no previous page',
  })
  prev_page: number | null;

  @ApiProperty({ description: 'Number of records per page' })
  per_page: number;

  @ApiProperty({ description: 'Offset used for this page' })
  offset: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Array of user records',
  })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  pagination: PaginationMetaDto;
}
