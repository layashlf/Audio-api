import { SubscriptionTier } from '../domain/entities/subscription';

export class SubscriptionResponseDto {
  userId: string;
  tier: SubscriptionTier;
  rateLimit: number;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
