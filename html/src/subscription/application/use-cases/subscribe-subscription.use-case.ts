import { Injectable, Inject } from '@nestjs/common';
import {
  Subscription,
  SubscriptionTier,
} from '../../domain/entities/subscription';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class SubscribeSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<Subscription> {
    // Subscribe to PAID tier
    // TODO: Implement payment processing integration (Stripe/PayPal) for subscription
    return await this.subscriptionRepository.updateTier(
      userId,
      SubscriptionTier.PAID,
    );
  }
}
