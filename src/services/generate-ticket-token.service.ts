import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GenerateTicketTokenService {
 private readonly secretKey = process.env.JWT_SECRET || 'secretKey';

 execute(eventId: string, userId: string): { ticketId: string, token: string } {
  const ticketId = uuidv4();

  const payload = {
   sub: ticketId,
   eventId,
   userId
  };

  return {
   ticketId,
   token: jwt.sign(payload, this.secretKey)
  }
 }
}