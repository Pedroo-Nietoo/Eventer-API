import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesOptions } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
 constructor(private reflector: Reflector) { }

 canActivate(context: ExecutionContext): boolean {
  const rolesOptions = this.reflector.getAllAndOverride<RolesOptions>(ROLES_KEY, [
   context.getHandler(),
   context.getClass(),
  ]);

  if (!rolesOptions) {
   return true;
  }

  const { user } = context.switchToHttp().getRequest();

  if (!user || !user.role) {
   return false;
  }

  const { allow, deny } = rolesOptions;

  if (deny && deny.includes(user.role)) {
   return false;
  }

  if (allow && allow.length > 0) {
   return allow.includes(user.role);
  }

  return true;
 }
}