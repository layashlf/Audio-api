import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PromptRepository } from '../../domain/repositories/prompt.repository';
import { Prompt, PromptStatus } from '../../domain/entities/prompt';

@Injectable()
export class PrismaPromptRepository implements PromptRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
      include: { audio: true },
    });
    if (!prompt) return null;
    return new Prompt(
      prompt.id,
      prompt.text,
      prompt.status as PromptStatus,
      prompt.priority,
      prompt.userId,
      prompt.createdAt,
      prompt.updatedAt,
      prompt.audio?.id,
    );
  }

  async findByUserId(
    userId: string,
    limit: number = 10,
    offset: number = 0,
    filters?: { status?: string },
  ): Promise<Prompt[]> {
    const where: any = { userId };
    if (filters?.status) {
      where.status = filters.status;
    }

    const prompts = await this.prisma.prompt.findMany({
      where,
      include: { audio: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return prompts.map(
      (p) =>
        new Prompt(
          p.id,
          p.text,
          p.status as PromptStatus,
          p.priority,
          p.userId,
          p.createdAt,
          p.updatedAt,
          p.audio?.id,
        ),
    );
  }

  async countByUserId(
    userId: string,
    filters?: { status?: string },
  ): Promise<number> {
    const where: any = { userId };
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.prisma.prompt.count({ where });
  }

  async findPending(): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { audio: true },
    });
    return prompts.map(
      (p) =>
        new Prompt(
          p.id,
          p.text,
          p.status as PromptStatus,
          p.priority,
          p.userId,
          p.createdAt,
          p.updatedAt,
          p.audio?.id,
        ),
    );
  }

  async create(
    data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Prompt> {
    const prompt = await this.prisma.prompt.create({
      data: {
        text: data.text,
        status: data.status,
        priority: data.priority,
        userId: data.userId,
      },
      include: { audio: true },
    });
    return new Prompt(
      prompt.id,
      prompt.text,
      prompt.status as PromptStatus,
      prompt.priority,
      prompt.userId,
      prompt.createdAt,
      prompt.updatedAt,
      prompt.audio?.id,
    );
  }

  async update(id: string, data: Partial<Prompt>): Promise<Prompt> {
    const prompt = await this.prisma.prompt.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority,
        audio: data.audioId ? { connect: { id: data.audioId } } : undefined,
      },
      include: { audio: true },
    });
    return new Prompt(
      prompt.id,
      prompt.text,
      prompt.status as PromptStatus,
      prompt.priority,
      prompt.userId,
      prompt.createdAt,
      prompt.updatedAt,
      prompt.audio?.id,
    );
  }
}
