import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SessionService } from 'src/infra/redis/session.service';

@Injectable()
export class JwtAuthGuard {
 constructor(
  private reflector: Reflector,
  private readonly sessionService: SessionService,
  private readonly jwtService: JwtService,
 ) { }

 async canActivate(context: ExecutionContext): Promise<boolean> {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
   context.getHandler(),
   context.getClass(),
  ]);

  if (isPublic) return true;

  const request = context.switchToHttp().getRequest();
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
   throw new UnauthorizedException('Cabeçalho de autorização inválido');
  }

  const opaqueToken = authHeader.replace('Bearer ', '');

  const jwtToken = await this.sessionService.getSession(opaqueToken);

  if (!jwtToken) {
   throw new UnauthorizedException('Sessão expirada ou token inválido');
  }

  try {
   const payload = await this.jwtService.verifyAsync(jwtToken);

   request.user = {
    id: payload.sub,
    role: payload.role,
   };

  } catch (error) {
   throw new UnauthorizedException('Falha na validação do token interno');
  }

  return true;
 }
}