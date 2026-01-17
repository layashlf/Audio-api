import { IsEnum } from 'class-validator';
import { SubscriptionTier } from '../domain/entities/subscription';

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;
}
