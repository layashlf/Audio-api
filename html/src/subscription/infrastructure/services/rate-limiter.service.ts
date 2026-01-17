import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import Redis from 'ioredis';
import { Subscription } from '../../domain/entities/subscription';

@Injectable()
export class RateLimiterService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'nest-redis-server',
      port: 6379,
    });
  }

  async checkRateLimit(
    userId: string,
    subscription: Subscription,
  ): Promise<void> {
    const key = `rate_limit:${userId}`;
    const windowMs = 60 * 1000; // 1 minute
    const limit = subscription.getRateLimit();

    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove old entries and count current requests
    const multi = this.redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now, now.toString());
    multi.expire(key, 60); // expire after 1 minute

    const results = await multi.exec();
    const requestCount = results![1][1] as number;

    if (requestCount >= limit) {
      throw new HttpException(
        `Rate limit exceeded. ${limit} requests per minute allowed.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
