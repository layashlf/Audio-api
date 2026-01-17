import { UserStatus, SubscriptionTier } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  status: UserStatus;
  subscriptionStatus: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}
