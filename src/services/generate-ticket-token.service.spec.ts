import { Test, TestingModule } from '@nestjs/testing';
import { GenerateTicketTokenService } from './generate-ticket-token.service';

describe('GenerateTicketTokenService', () => {
  let service: GenerateTicketTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateTicketTokenService],
    }).compile();

    service = module.get<GenerateTicketTokenService>(GenerateTicketTokenService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('deve retornar um objeto com ticketId (UUID) e token (hex)', () => {
      const result = service.execute();

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.ticketId).toMatch(uuidRegex);

      const hexRegex = /^[0-9a-f]{32}$/i;
      expect(result.token).toMatch(hexRegex);
    });

    it('deve gerar valores únicos em cada chamada', () => {
      const call1 = service.execute();
      const call2 = service.execute();

      expect(call1.ticketId).not.toBe(call2.ticketId);
      expect(call1.token).not.toBe(call2.token);
    });
  });
});