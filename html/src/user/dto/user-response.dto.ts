import { ApiProperty } from '@nestjs/swagger';
import { UserStatus, SubscriptionTier } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ description: 'User unique identifier' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User display name', required: false })
  displayName?: string;

  @ApiProperty({
    description: 'User account status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'User subscription tier',
    enum: SubscriptionTier,
    example: SubscriptionTier.FREE,
  })
  subscriptionStatus: SubscriptionTier;
}
