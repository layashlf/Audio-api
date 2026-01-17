import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../utils/helper.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from '../utils/EmailProcessor.service';
import { PrivilegeTokenStrategy } from './strategies/privilegeToken.strategy';

// Domain
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/prisma-refresh-token.repository';
import { TokenService } from './infrastructure/services/token.service';

// Use Cases
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { CheckEmailExistsUseCase } from './application/use-cases/check-email-exists.use-case';

@Module({
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PrivilegeTokenStrategy,
    EmailProcessor,
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: PrismaRefreshTokenRepository,
    },
    // Services
    TokenService,
    // Use Cases
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    CheckEmailExistsUseCase,
  ],
  imports: [
    PrismaModule,
    JwtModule,
    HelperModule,
    BullModule.registerQueue({ name: 'email' }),
  ],
})
export class AuthenticationModule {}
