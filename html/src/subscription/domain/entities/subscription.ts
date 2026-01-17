export enum SubscriptionTier {
  FREE = 'FREE',
  PAID = 'PAID',
}

export class Subscription {
  constructor(
    public readonly userId: string,
    public readonly tier: SubscriptionTier,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isPaid(): boolean {
    return this.tier === SubscriptionTier.PAID;
  }

  getRateLimit(): number {
    return this.isPaid() ? 100 : 20; // requests per minute
  }

  getPriority(): number {
    return this.isPaid() ? 1 : 0; // higher priority for paid
  }
}
