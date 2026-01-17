import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  Subscription,
  SubscriptionTier,
} from '../../domain/entities/subscription';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Subscription | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    return new Subscription(
      user.id,
      user.subscriptionStatus as SubscriptionTier,
      user.createdAt,
      user.updatedAt,
    );
  }

  async updateTier(
    userId: string,
    tier: SubscriptionTier,
  ): Promise<Subscription> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: tier },
      select: {
        id: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new Subscription(
      user.id,
      user.subscriptionStatus as SubscriptionTier,
      user.createdAt,
      user.updatedAt,
    );
  }
}
