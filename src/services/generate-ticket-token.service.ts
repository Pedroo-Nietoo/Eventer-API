import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GenerateTicketTokenService {
  execute(): { ticketId: string; token: string } {
    const ticketId = uuidv4();

    const token = randomBytes(16).toString('hex');

    return {
      ticketId,
      token,
    };
  }
}
