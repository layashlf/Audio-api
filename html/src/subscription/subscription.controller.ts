import {
  Controller,
  Get,
  Post,
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
import { SubscribeSubscriptionUseCase } from './application/use-cases/subscribe-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { Subscription } from './domain/entities/subscription';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(AccessTokenGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SubscriptionController {
  constructor(
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
    private readonly subscribeSubscriptionUseCase: SubscribeSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async getSubscription(@Request() req): Promise<SubscriptionResponseDto> {
    const subscription = await this.getSubscriptionUseCase.execute(
      req.user.sub,
    );
    return this.mapToResponseDto(subscription);
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to PAID tier' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async subscribeSubscription(
    @Request() req,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscribeSubscriptionUseCase.execute(
      req.user.sub,
    );
    return this.mapToResponseDto(subscription);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription (downgrade to FREE)' })
  @ApiResponse({ status: 200, type: SubscriptionResponseDto })
  async cancelSubscription(@Request() req): Promise<SubscriptionResponseDto> {
    const subscription = await this.cancelSubscriptionUseCase.execute(
      req.user.sub,
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
    };
  }
}
