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
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedUsersResponseDto } from './dto/pagination-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './domain/entities/user';
import { SubscriptionTier } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
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
    description: 'Items to skip',
  })
  @ApiQuery({
    name: 'subscriptionStatus',
    required: false,
    enum: SubscriptionTier,
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('offset') offset?: number,
    @Query('subscriptionStatus') subscriptionStatus?: SubscriptionTier,
  ): Promise<PaginatedUsersResponseDto> {
    // Calculate offset from page if provided
    if (page && page > 0) {
      offset = (page - 1) * limit;
    } else if (!offset) {
      offset = 0;
    }

    const filters = subscriptionStatus ? { subscriptionStatus } : undefined;
    const result = await this.getUsersUseCase.execute(limit, offset, filters);

    return {
      data: result.users.map(this.mapToDto),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto | null> {
    const user = await this.getUserByIdUseCase.execute(id);
    return user ? this.mapToDto(user) : null;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return user ? this.mapToDto(user) : null;
  }

  private mapToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      status: user.status,
      subscriptionStatus: user.subscriptionStatus,
    };
  }
}
