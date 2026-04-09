import { TicketMapper } from './ticket.mapper';
import { TicketStatus } from '@tickets/entities/ticket.entity';

describe('TicketMapper', () => {
 const baseDate = new Date('2026-10-15T20:00:00Z');

 describe('toResponse', () => {
  it('deve mapear a entidade completa com todas as relações (User, TicketType, Event)', () => {

   const mockFullEntity = {
    id: 'ticket-123',
    qrCode: 'abc-123-qr',
    status: TicketStatus.VALID,
    createdAt: baseDate,
    purchasePrice: 150.00,
    user: {
     id: 'user-456',
     username: 'pedronieto',
     email: 'pedro@test.com',
     password: 'hashed_password_ignored',
    },
    ticketType: {
     id: 'lote-789',
     name: 'Lote VIP',
     price: 150.00,
     totalQuantity: 100,
     event: {
      id: 'event-000',
      title: 'NestJS Summit',
      description: 'Ignorado pelo mapper',
     },
    },
   } as any;


   const result = TicketMapper.toResponse(mockFullEntity);


   expect(result).toEqual({
    id: 'ticket-123',
    qrCode: 'abc-123-qr',
    status: TicketStatus.VALID,
    createdAt: baseDate,
    purchasePrice: 150.00,
    user: {
     id: 'user-456',
     username: 'pedronieto',
     email: 'pedro@test.com',
    },
    ticketType: {
     id: 'lote-789',
     name: 'Lote VIP',
     price: 150.00,
     event: {
      id: 'event-000',
      title: 'NestJS Summit',
     },
    },
   });


   expect((result.user as any).password).toBeUndefined();
  });

  it('deve mapear a entidade com segurança quando relações estiverem ausentes (undefined)', () => {

   const mockPartialEntity = {
    id: 'ticket-999',
    qrCode: 'xyz-999-qr',
    status: TicketStatus.CANCELLED,
    createdAt: baseDate,
    purchasePrice: 50.00,

    ticketType: {
     id: 'lote-333',
     name: 'Pista',
     price: 50.00,

    },
   } as any;


   const result = TicketMapper.toResponse(mockPartialEntity);


   expect(result.id).toBe('ticket-999');

   expect(result.user.id).toBeUndefined();
   expect(result.user.email).toBeUndefined();


   expect(result.ticketType.event).toBeUndefined();
  });
 });

 describe('toResponseList', () => {
  it('deve mapear um array de entidades para um array de DTOs', () => {

   const mockEntities = [
    { id: 't-1', ticketType: { name: 'VIP' } },
    { id: 't-2', ticketType: { name: 'Pista' } },
   ] as any[];


   const result = TicketMapper.toResponseList(mockEntities);


   expect(result).toHaveLength(2);
   expect(result[0].id).toBe('t-1');
   expect(result[0].ticketType.name).toBe('VIP');
   expect(result[1].id).toBe('t-2');
   expect(result[1].ticketType.name).toBe('Pista');
  });

  it('deve retornar um array vazio se receber um array vazio', () => {
   expect(TicketMapper.toResponseList([])).toEqual([]);
  });
 });
});