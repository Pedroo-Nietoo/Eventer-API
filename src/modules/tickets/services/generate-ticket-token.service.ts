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
   // Você pode adicionar uma data de expiração se o ingresso for dinâmico
  };

  // Gera o token que será salvo na coluna qrCode da entidade Ticket
  return jwt.sign(payload, this.secretKey);
 }
}