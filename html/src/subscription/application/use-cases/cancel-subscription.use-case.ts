import { Injectable, Inject } from '@nestjs/common';
import {
  Subscription,
  SubscriptionTier,
} from '../../domain/entities/subscription';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<Subscription> {
    // Cancel subscription by downgrading to FREE tier
    return await this.subscriptionRepository.updateTier(
      userId,
      SubscriptionTier.FREE,
    );
  }
}
