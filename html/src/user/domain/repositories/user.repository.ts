import { User } from '../entities/user';
import { SubscriptionTier } from '@prisma/client';

export interface UserRepository {
  findAll(
    limit?: number,
    offset?: number,
    filters?: { subscriptionStatus?: SubscriptionTier },
  ): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  count(filters?: { subscriptionStatus?: SubscriptionTier }): Promise<number>;
}
