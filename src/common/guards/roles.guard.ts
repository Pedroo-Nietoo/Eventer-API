import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY, RolesOptions } from '@common/decorators/roles.decorator';
import { AuthenticatedUser } from '@common/decorators/current-user.decorator';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesOptions = this.reflector.getAllAndOverride<RolesOptions>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user?.role) {
      return false;
    }

    const { allow, deny } = rolesOptions;

    if (deny?.includes(user.role)) {
      return false;
    }

    if (allow && allow.length > 0) {
      return allow.includes(user.role);
    }

    return true;
  }
}
