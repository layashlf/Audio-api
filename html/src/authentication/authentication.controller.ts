import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  Res,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';

import { AuthenticationService } from './authentication.service';
import { TransformInterceptor } from '../interceptors/response-transformer/response-transformer.interceptor';
import { ConfigService } from '@nestjs/config';
import { ApiHeader } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

import { Request, Response } from 'express';
import { AuditLog } from 'src/decorators/auditLog.decorator';
import { RefreshTokenGuard } from './guard/refresh-token.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(new TransformInterceptor(RegisterResponseDto))
  @AuditLog('user_registration')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authenticationService.register(registerDto);
  }

  @ApiHeader({
    name: 'user-agent',
    description: 'The user agent of the browser (sent automatically)',
    required: false,
  })
  @Post('login')
  @UseInterceptors(new TransformInterceptor(LoginResponseDto))
  @AuditLog('user_login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const res = await this.authenticationService.login(
      loginDto,
      request,
      userAgent,
    );

    if (res.refreshToken) {
      // Set refresh token as httpOnly cookie for security
      // httpOnly prevents JavaScript access, secure requires HTTPS
      // sameSite prevents CSRF, path limits to refresh endpoint
      response.cookie('refresh_token', res.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
        expires: new Date(
          Date.now() +
            this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT'),
        ),
      });
      return {
        accessToken: res.accessToken,
        user: res.user,
      };
    }
    return res;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Query() queryParams,
    @Req() request: Request,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = request.user['sub'];

    const refpayload = { sub: userId };
    const res = await this.authenticationService.refreshTokens(
      refpayload,
      request,
    );
    if (res.refreshToken) {
      response.cookie('refresh_token', res.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
        expires: new Date(
          Date.now() +
            this.configService.get<number>('JWT_REFRESH_TOKEN_EXPIRE_AT'),
        ),
      });
      return {
        accessToken: res.accessToken,
        user: res.user,
      };
    }
    return res;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  @AuditLog('user_logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authenticationService.logout(request);

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { message: 'Logged out successfully' };
  }

  @Get('email')
  checkIfEmailExists(@Query('email') email: string) {
    return this.authenticationService.checkIfEmailExists(email);
  }
}
