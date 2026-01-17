import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guard/access-token.guard';
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case';
import { UpgradeSubscriptionUseCase } from './application/use-cases/upgrade-subscription.use-case';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { Subscription } from './domain/entities/subscription';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(AccessTokenGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SubscriptionController {
  constructor(
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly upgradeSubscriptionUseCase: UpgradeSubscriptionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async getSubscription(@Request() req): Promise<SubscriptionResponseDto> {
    const subscription = await this.getSubscriptionUseCase.execute(req.user.id);
    return this.mapToResponseDto(subscription);
  }

  @Put('upgrade')
  @ApiOperation({ summary: 'Upgrade user subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async upgradeSubscription(
    @Request() req,
    @Body() dto: UpgradeSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.upgradeSubscriptionUseCase.execute(
      req.user.id,
      dto.tier,
    );
    return this.mapToResponseDto(subscription);
  }

  private mapToResponseDto(
    subscription: Subscription,
  ): SubscriptionResponseDto {
    return {
      userId: subscription.userId,
      tier: subscription.tier,
      rateLimit: subscription.getRateLimit(),
      priority: subscription.getPriority(),
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
