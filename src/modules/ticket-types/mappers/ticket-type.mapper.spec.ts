import { TicketTypeMapper } from './ticket-type.mapper';

describe('TicketTypeMapper', () => {
 const baseDate = new Date('2026-06-15T10:00:00Z');

 describe('toResponse', () => {
  it('deve mapear a entidade com a relação de evento preenchida', () => {

   const mockEntityWithEvent = {
    id: 'lote-123',
    name: 'Lote VIP',
    description: 'Acesso antecipado',
    price: 150.99,
    totalQuantity: 100,
    availableQuantity: 50,
    createdAt: baseDate,
    updatedAt: baseDate,
    event: { id: 'event-456', title: 'Ignorado no Mapper' },
   } as any;


   const result = TicketTypeMapper.toResponse(mockEntityWithEvent);


   expect(result).toEqual({
    id: 'lote-123',
    name: 'Lote VIP',
    description: 'Acesso antecipado',
    price: 150.99,
    totalQuantity: 100,
    availableQuantity: 50,
    createdAt: baseDate,
    updatedAt: baseDate,
    event: { id: 'event-456' },
   });
  });

  it('deve mapear a entidade retornando undefined para o evento quando a relação não existir', () => {

   const mockEntityWithoutEvent = {
    id: 'lote-789',
    name: 'Lote Pista',
    price: 50.99,

   } as any;


   const result = TicketTypeMapper.toResponse(mockEntityWithoutEvent);


   expect(result.id).toBe('lote-789');
   expect(result.name).toBe('Lote Pista');
   expect(result.event).toBeUndefined();
  });
 });

 describe('toResponseList', () => {
  it('deve mapear um array de entidades TicketType para um array de DTOs', () => {

   const mockEntities = [
    { id: '1', name: 'Lote 1', event: { id: 'e-1' } },
    { id: '2', name: 'Lote 2', event: null },
   ] as any[];


   const result = TicketTypeMapper.toResponseList(mockEntities);


   expect(result).toHaveLength(2);
   expect(result[0].id).toBe('1');
   expect(result[0].event).toEqual({ id: 'e-1' });

   expect(result[1].id).toBe('2');
   expect(result[1].event).toBeUndefined();
  });

  it('deve retornar um array vazio se receber um array vazio', () => {
   expect(TicketTypeMapper.toResponseList([])).toEqual([]);
  });
 });
});