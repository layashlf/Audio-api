import { Module } from '@nestjs/common';

import { SentryModule } from '@sentry/nestjs/setup';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envValidation } from './config/env.validation';

@Module({
  imports: [
    SentryModule.forRoot(),

    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: envValidation,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
