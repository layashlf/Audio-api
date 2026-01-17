import { Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import { plainToInstance } from 'class-transformer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { ITokenPayload } from './interfaces';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { CheckEmailExistsUseCase } from './application/use-cases/check-email-exists.use-case';

import { Request } from 'express';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthenticationService {
  // Service that calls the use cases and handles HTTP-specific stuff
  // Like sending emails and formatting responses for the API
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly checkEmailExistsUseCase: CheckEmailExistsUseCase,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const result = await this.registerUserUseCase.execute({
      email: registerDto.email,
      password: registerDto.password,
      displayName: registerDto.displayName,
      status: UserStatus.ACTIVE,
    });

    return plainToInstance(RegisterResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async login(loginData: LoginDto): Promise<Partial<LoginResponseDto>> {
    const result = await this.loginUseCase.execute({
      email: loginData.email,
      password: loginData.password,
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: plainToInstance(UserInfoDto, result.user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async refreshTokens(payload: ITokenPayload, request: Request) {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const result = await this.refreshTokensUseCase.execute({
      userId: payload.sub,
      refreshToken,
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: plainToInstance(UserInfoDto, result.user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  async logout(request: Request): Promise<void> {
    const refreshToken = request.cookies['refresh_token'];

    await this.logoutUseCase.execute({
      refreshToken,
    });
  }

  async checkIfEmailExists(email: string) {
    return await this.checkEmailExistsUseCase.execute({ email });
  }
}
