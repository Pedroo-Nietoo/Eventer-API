import { Test, TestingModule } from '@nestjs/testing';
import { ValidateTicketUseCase } from './validate-ticket.usecase';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { TicketStatus } from '@tickets/entities/ticket.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ValidateTicketUseCase', () => {
 let useCase: ValidateTicketUseCase;
 let ticketsRepository: TicketsRepository;

 const mockTicketsRepository = {
  findByQrCodeWithRelations: jest.fn(),
  save: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ValidateTicketUseCase,
    {
     provide: TicketsRepository,
     useValue: mockTicketsRepository,
    },
   ],
  }).compile();

  useCase = module.get<ValidateTicketUseCase>(ValidateTicketUseCase);
  ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
 });

 describe('execute', () => {
  const qrCode = 'valid-qr-code-token';
  const pastDate = '2020-01-01T00:00:00Z';
  const futureDate = '2099-01-01T00:00:00Z';


  const baseTicket = {
   id: 'ticket-1',
   status: TicketStatus.VALID,
   ticketType: {
    name: 'VIP',
    event: {
     eventDate: pastDate,
    },
   },
  };

  it('deve validar um ingresso com sucesso', async () => {

   const ticket = { ...baseTicket, ticketType: { ...baseTicket.ticketType } };
   mockTicketsRepository.findByQrCodeWithRelations.mockResolvedValueOnce(ticket);
   mockTicketsRepository.save.mockResolvedValueOnce({ ...ticket, status: TicketStatus.USED });

   const result = await useCase.execute(qrCode);

   expect(result.success).toBe(true);
   expect(ticket.status).toBe(TicketStatus.USED);
  });

  it('deve lançar NotFoundException para QR Code inexistente', async () => {
   mockTicketsRepository.findByQrCodeWithRelations.mockResolvedValueOnce(null);

   await expect(useCase.execute('invalid')).rejects.toThrow(
    new NotFoundException('Ingresso não encontrado ou QR Code inválido.')
   );
  });

  it('deve lançar BadRequestException se a data do evento for futura', async () => {

   const ticketFuturo = {
    ...baseTicket,
    ticketType: {
     ...baseTicket.ticketType,
     event: { eventDate: futureDate }
    }
   };

   mockTicketsRepository.findByQrCodeWithRelations.mockResolvedValueOnce(ticketFuturo);

   await expect(useCase.execute(qrCode)).rejects.toThrow(
    new BadRequestException('Este ingresso ainda não pode ser validado. O evento ocorrerá em breve.')
   );
  });

  it('deve validar corretamente usando datas simuladas (Fake Timers)', async () => {
   const eventDateStr = '2026-05-10T10:00:00Z';
   const now = new Date('2026-05-10T11:00:00Z');

   jest.useFakeTimers().setSystemTime(now);

   const ticketNoDia = {
    ...baseTicket,
    ticketType: {
     ...baseTicket.ticketType,
     event: { eventDate: eventDateStr }
    }
   };

   mockTicketsRepository.findByQrCodeWithRelations.mockResolvedValueOnce(ticketNoDia);
   mockTicketsRepository.save.mockResolvedValueOnce(ticketNoDia);

   const result = await useCase.execute(qrCode);
   expect(result.success).toBe(true);
  });


  it('deve barrar ingresso cancelado', async () => {
   mockTicketsRepository.findByQrCodeWithRelations.mockResolvedValueOnce({
    ...baseTicket,
    status: TicketStatus.CANCELLED
   });

   await expect(useCase.execute(qrCode)).rejects.toThrow(BadRequestException);
  });
 });
});