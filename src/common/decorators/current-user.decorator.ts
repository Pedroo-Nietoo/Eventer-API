import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';
import { Request } from 'express';

export interface AuthenticatedUser {
 id: string;
 role: UserRole;
}
interface AuthenticatedRequest extends Request {
 user?: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
 (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

  const user = request.user as AuthenticatedUser;

  return data ? user?.[data] : user;
 },
);