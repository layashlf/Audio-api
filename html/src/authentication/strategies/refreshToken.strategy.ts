// src/auth/strategies/refreshToken.strategy.ts

import { PassportStrategy } from '@nestjs/passport';
import {  Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['refresh_token'];
        }
        return null;
      },
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      // Pass the request object to the validate method
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies['refresh_token'];
    return { ...payload, refreshToken };
  }
}