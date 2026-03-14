import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class GenerateTicketTokenService {
 private readonly secretKey = process.env.JWT_SECRET || 'chave-super-secreta-do-evento';

 execute(ticketId: string, eventId: string, userId: string): string {
  const payload = {
   sub: ticketId,
   eventId,
   userId,
  };

  return jwt.sign(payload, this.secretKey);
 }
}