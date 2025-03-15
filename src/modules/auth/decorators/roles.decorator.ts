import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * A constant key used to store roles metadata.
 * @constant
 */
export const ROLES_KEY = 'roles';

/**
 * A decorator that assigns roles to a route handler.
 *
 * This decorator uses `SetMetadata` to attach the specified roles to the route handler's metadata.
 * The roles can then be used by guards or other mechanisms to enforce access control.
 *
 * @param {...Role[]} roles - The roles to be assigned to the route handler.
 * @returns {CustomDecorator<string>} - A custom decorator that sets the roles metadata.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
