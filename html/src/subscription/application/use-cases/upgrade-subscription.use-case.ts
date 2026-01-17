import { Injectable, Inject } from '@nestjs/common';
import {
  Subscription,
  SubscriptionTier,
} from '../../domain/entities/subscription';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class UpgradeSubscriptionUseCase {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(userId: string, tier: SubscriptionTier): Promise<Subscription> {
    // TODO: Implement payment processing integration (Stripe/PayPal) for subscription upgrades
    return await this.subscriptionRepository.updateTier(userId, tier);
  }
}
