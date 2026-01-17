import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrivilegedJwtPayload } from '../strategies/privilegeToken.strategy';

@Injectable()
export class PrivilegedActionGuard extends AuthGuard('privilege-jwt') {

    constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const requiredPrivilege = this.reflector.get<string>(
      'privilege',
      context.getHandler(),
    );
    if (!requiredPrivilege) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as PrivilegedJwtPayload;

    if (user.privilegeLevel !== requiredPrivilege) {
      throw new ForbiddenException('Insufficient privileges for this action.');
    }

    return true;
  }

}