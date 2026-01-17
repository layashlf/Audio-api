import { UserStatus, SubscriptionTier } from '@prisma/client';

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public displayName?: string,
    public emailVerified: boolean = false,
    public status: UserStatus = UserStatus.PENDING_APPROVAL,
    public subscriptionStatus: SubscriptionTier = SubscriptionTier.FREE,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static fromPersistence(data: {
    id: string;
    email: string;
    displayName?: string;
    emailVerified: boolean;
    status: UserStatus;
    subscriptionStatus: SubscriptionTier;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.displayName,
      data.emailVerified,
      data.status,
      data.subscriptionStatus,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateDisplayName(displayName?: string): void {
    this.displayName = displayName;
    this.updatedAt = new Date();
  }

  toPersistence(): {
    id: string;
    email: string;
    displayName?: string;
    emailVerified: boolean;
    status: UserStatus;
    subscriptionStatus: SubscriptionTier;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      emailVerified: this.emailVerified,
      status: this.status,
      subscriptionStatus: this.subscriptionStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
