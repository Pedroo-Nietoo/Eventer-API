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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
