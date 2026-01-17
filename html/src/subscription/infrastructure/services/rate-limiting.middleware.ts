import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rate-limiter.service';
import { GetSubscriptionUseCase } from '../../application/use-cases/get-subscription.use-case';

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly getSubscriptionUseCase: GetSubscriptionUseCase,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (user && user.id) {
      try {
        const subscription = await this.getSubscriptionUseCase.execute(user.id);
        await this.rateLimiterService.checkRateLimit(user.id, subscription);
      } catch (error) {
        return next(error);
      }
    }
    next();
  }
}
