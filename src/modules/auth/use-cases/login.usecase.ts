import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { SessionService } from 'src/infra/redis/session.service';

@Injectable()
export class LoginUseCase {
 constructor(
  private readonly sessionService: SessionService,
  private readonly jwtService: JwtService,
 ) { }

 async execute(user: any) {
  const payload = { sub: user.id, role: user.role };

  const jwtToken = await this.jwtService.signAsync(payload);

  const opaqueToken = randomBytes(32).toString('hex');

  await this.sessionService.createSession(opaqueToken, jwtToken);

  return { access_token: opaqueToken };
 }
}