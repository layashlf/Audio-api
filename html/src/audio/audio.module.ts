import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { PrismaAudioRepository } from './infrastructure/repositories/prisma-audio.repository';
import { GetAudiosUseCase } from './application/use-cases/get-audios.use-case';
import { GetAudioByIdUseCase } from './application/use-cases/get-audio-by-id.use-case';
import { UpdateAudioUseCase } from './application/use-cases/update-audio.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [PrismaModule, SearchModule],
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
  exports: ['AudioRepository'],
})
export class AudioModule {}
