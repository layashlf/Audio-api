import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { PrismaAudioRepository } from './infrastructure/repositories/prisma-audio.repository';
import { GetAudiosUseCase } from './application/use-cases/get-audios.use-case';
import { GetAudioByIdUseCase } from './application/use-cases/get-audio-by-id.use-case';
import { UpdateAudioUseCase } from './application/use-cases/update-audio.use-case';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AudioController],
  providers: [
    {
      provide: 'AudioRepository',
      useClass: PrismaAudioRepository,
    },
    GetAudiosUseCase,
    GetAudioByIdUseCase,
    UpdateAudioUseCase,
  ],
  exports: [],
})
export class AudioModule {}
