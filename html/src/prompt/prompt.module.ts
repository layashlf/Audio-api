import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PromptController } from './prompt.controller';
import { CreatePromptUseCase } from './application/use-cases/create-prompt.use-case';
import { GetPromptsUseCase } from './application/use-cases/get-prompts.use-case';
import { PrismaPromptRepository } from './infrastructure/repositories/prisma-prompt.repository';

@Module({
  imports: [PrismaModule, SubscriptionModule],
  controllers: [PromptController],
  providers: [
    {
      provide: 'PromptRepository',
      useClass: PrismaPromptRepository,
    },
    CreatePromptUseCase,
    GetPromptsUseCase,
  ],
  exports: ['PromptRepository'],
})
export class PromptModule {}
