import { SessionService } from '@infra/redis/session.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { AuthenticatedUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class LoginUseCase {
 constructor(
  private readonly sessionService: SessionService,
  private readonly jwtService: JwtService,
 ) { }

 async execute(user: AuthenticatedUser) {
  const payload = { sub: user.id, role: user.role };

  const jwtToken = await this.jwtService.signAsync(payload);

  const opaqueToken = randomBytes(32).toString('hex');

  await this.sessionService.createSession(opaqueToken, jwtToken);

  return { access_token: opaqueToken };
 }
}