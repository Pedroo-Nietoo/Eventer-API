import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY, ExcludeRole } from '../decorators/roles.decorator';

/**
 * Guard para controle de acesso baseado em papéis.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Creates an instance of RolesGuard.
   * @param reflector - The Reflector service used to retrieve metadata about roles.
   */
  constructor(private reflector: Reflector) { }

  /**
   * Determines whether the current request is allowed based on the user's roles.
   * 
   * @param context - The execution context of the request, which provides access to the handler and class metadata.
   * @returns A boolean indicating whether the request is allowed.
   * @throws {ForbiddenException} If the user does not have the required roles or has excluded roles.
   */
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<(Role | ExcludeRole)[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Usuário não possui ROLE.');
    }

    const requiredRoles = roles.filter(role => !(role instanceof ExcludeRole)) as Role[];
    const excludedRoles = roles
      .filter(role => role instanceof ExcludeRole)
      .flatMap(role => (role as ExcludeRole).roles);

    if (excludedRoles.length > 0 && excludedRoles.some(role => user.role.includes(role))) {
      throw new ForbiddenException('Usuário não tem permissão para acessar este recurso.');
    }

    if (requiredRoles.length > 0 && !requiredRoles.some(role => user.role.includes(role))) {
      throw new ForbiddenException('Usuário não tem permissão para acessar este recurso.');
    }

    return true;
  }
}
