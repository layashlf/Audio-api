import { Subscription } from '../entities/subscription';

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>;
  updateTier(userId: string, tier: Subscription['tier']): Promise<Subscription>;
}
