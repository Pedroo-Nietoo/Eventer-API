import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';

export const ROLES_KEY = 'roles';

export interface RolesOptions {
  allow?: UserRole[];
  deny?: UserRole[];
}

export const Roles = (options: RolesOptions) => SetMetadata(ROLES_KEY, options);
