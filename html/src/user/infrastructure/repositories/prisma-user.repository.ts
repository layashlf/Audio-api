import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) =>
      User.fromPersistence({
        id: user.id,
        email: user.email,
        displayName: user.displayName || undefined,
        emailVerified: user.emailVerified,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return User.fromPersistence({
      id: user.id,
      email: user.email,
      displayName: user.displayName || undefined,
      emailVerified: user.emailVerified,
      status: user.status,
      subscriptionStatus: user.subscriptionStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          displayName: updates.displayName,
          updatedAt: new Date(),
        },
      });

      return User.fromPersistence({
        id: user.id,
        email: user.email,
        displayName: user.displayName || undefined,
        emailVerified: user.emailVerified,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch {
      return null;
    }
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }
}
