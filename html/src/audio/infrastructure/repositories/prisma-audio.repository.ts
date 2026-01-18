import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AudioRepository } from '../../domain/repositories/audio.repository';
import { Audio } from '../../domain/entities/audio';

@Injectable()
export class PrismaAudioRepository implements AudioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    url: string;
    promptId: string;
    userId: string;
    fileSize?: number;
    duration?: number;
  }): Promise<Audio> {
    const audio = await this.prisma.audio.create({
      data: {
        title: data.title,
        url: data.url,
        promptId: data.promptId,
        userId: data.userId,
        fileSize: data.fileSize,
        duration: data.duration,
      },
      select: {
        id: true,
        title: true,
        url: true,
        fileSize: true,
        duration: true,
        promptId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Audio.fromPersistence({
      id: audio.id,
      title: audio.title,
      url: audio.url,
      fileSize: audio.fileSize || undefined,
      duration: audio.duration || undefined,
      promptId: audio.promptId,
      userId: audio.userId,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    });
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<Audio[]> {
    const audios = await this.prisma.audio.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        url: true,
        fileSize: true,
        duration: true,
        promptId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return audios.map((audio) =>
      Audio.fromPersistence({
        id: audio.id,
        title: audio.title,
        url: audio.url,
        fileSize: audio.fileSize || undefined,
        duration: audio.duration || undefined,
        promptId: audio.promptId,
        userId: audio.userId,
        createdAt: audio.createdAt,
        updatedAt: audio.updatedAt,
      }),
    );
  }

  async findById(id: string): Promise<Audio | null> {
    const audio = await this.prisma.audio.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        fileSize: true,
        duration: true,
        promptId: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!audio) return null;

    return Audio.fromPersistence({
      id: audio.id,
      title: audio.title,
      url: audio.url,
      fileSize: audio.fileSize || undefined,
      duration: audio.duration || undefined,
      promptId: audio.promptId,
      userId: audio.userId,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
    });
  }

  async update(id: string, updates: Partial<Audio>): Promise<Audio | null> {
    try {
      const audio = await this.prisma.audio.update({
        where: { id },
        data: {
          title: updates.title,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          url: true,
          fileSize: true,
          duration: true,
          promptId: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return Audio.fromPersistence({
        id: audio.id,
        title: audio.title,
        url: audio.url,
        fileSize: audio.fileSize || undefined,
        duration: audio.duration || undefined,
        promptId: audio.promptId,
        userId: audio.userId,
        createdAt: audio.createdAt,
        updatedAt: audio.updatedAt,
      });
    } catch {
      return null;
    }
  }

  async count(): Promise<number> {
    return this.prisma.audio.count();
  }
}
