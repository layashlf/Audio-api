import { Module } from '@nestjs/common';

import { SentryModule } from '@sentry/nestjs/setup';
import { AuthenticationModule } from './authentication/authentication.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { UserModule } from './user/user.module';
import { AudioModule } from './audio/audio.module';
import { SearchModule } from './search/search.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { envValidation } from './config/env.validation';
import { HelperModule } from './utils/helper.module';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    SentryModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'nest-redis-server',
            port: 6379,
          },
        }),
      }),
    }),
    BullModule.forRoot({
      connection: {
        host: 'nest-redis-server',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'prompt-processing',
    }),
    AuthenticationModule,
    SubscriptionModule,
    UserModule,
    AudioModule,
    SearchModule,
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
    HelperModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
