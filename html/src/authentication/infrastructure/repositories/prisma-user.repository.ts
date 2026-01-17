import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { IUserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userData) {
      return null;
    }

    return User.fromPersistence(userData);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!userData) {
      return null;
    }

    return User.fromPersistence(userData);
  }

  async save(user: User): Promise<void> {
    const userData = user.toPersistence();
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: userData,
      create: userData,
    });
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }
}
