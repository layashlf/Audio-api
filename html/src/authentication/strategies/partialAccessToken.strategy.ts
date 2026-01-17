import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub: string;
  isTwoFactorAuthenticated: boolean;
};

@Injectable()
export class PartialAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-partial') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    if (payload.isTwoFactorAuthenticated !== false) {
      throw new UnauthorizedException('This is not a valid partial access token.');
    }
    return payload;
  }
}