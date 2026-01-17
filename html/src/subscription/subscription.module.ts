import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { PrismaSubscriptionRepository } from './infrastructure/repositories/prisma-subscription.repository';
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case';
import { SubscribeSubscriptionUseCase } from './application/use-cases/subscribe-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { RateLimiterService } from './infrastructure/services/rate-limiter.service';
import { RateLimitingMiddleware } from './infrastructure/services/rate-limiting.middleware';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionController],
  providers: [
    {
      provide: 'SubscriptionRepository',
      useClass: PrismaSubscriptionRepository,
    },
    GetSubscriptionUseCase,
    SubscribeSubscriptionUseCase,
    CancelSubscriptionUseCase,
    RateLimiterService,
  ],
  exports: [RateLimiterService, GetSubscriptionUseCase],
})
export class SubscriptionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitingMiddleware).forRoutes('*'); // Apply to all routes, but only authenticated ones will be checked
  }
}
