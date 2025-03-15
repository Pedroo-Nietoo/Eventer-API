import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard to handle role-based access control.
 * This guard checks if the user has the required roles to access a route.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Creates an instance of RolesGuard.
   * @param reflector - The Reflector service to get metadata.
   */
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user has the required roles to access the route.
   * @param context - The execution context of the request.
   * @returns A boolean indicating whether the user has the required roles.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
