import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { SessionService } from '@infra/redis/services/session.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
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
      const payload = await this.jwtService.verifyAsync<JwtPayload>(jwtToken);

      request.user = {
        id: payload.sub,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('Falha na validação do token interno');
    }

    return true;
  }
}
