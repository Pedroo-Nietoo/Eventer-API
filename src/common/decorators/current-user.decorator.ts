import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';

export interface AuthenticatedUser {
 id: string;
 role: UserRole;
}

export const CurrentUser = createParamDecorator(
 (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as AuthenticatedUser;

  return data ? user?.[data] : user;
 },
);