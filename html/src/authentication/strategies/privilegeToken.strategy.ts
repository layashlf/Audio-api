import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define the shape of your token payload
export type PrivilegedJwtPayload = {
  sub: string;
  sid: string;
  isTwoFactorAuthenticated: boolean;
  privilegeLevel: string;
};

@Injectable()
export class PrivilegeTokenStrategy extends PassportStrategy(
  Strategy,
  'privilege-jwt',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: PrivilegedJwtPayload): PrivilegedJwtPayload {
    return payload;
  }
}