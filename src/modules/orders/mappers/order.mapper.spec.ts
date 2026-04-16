import { OrderMapper } from './order.mapper';
import { OrderStatus } from '@common/enums/order-status.enum';

describe('OrderMapper', () => {
 const baseDate = new Date('2026-05-10T12:00:00Z');

 describe('toResponse', () => {
  it('deve mapear a entidade e converter valores monetários (strings do DB) para Number', () => {


   const mockOrderEntity = {
    id: 'order-123',
    userId: 'user-456',
    ticketTypeId: 'lote-789',
    quantity: 2,
    unitPrice: '75.50',
    totalPrice: '151.00',
    status: OrderStatus.PAID,
    createdAt: baseDate,
    updatedAt: baseDate,
   } as any;


   const result = OrderMapper.toResponse(mockOrderEntity);


   expect(result).toEqual({
    id: 'order-123',
    userId: 'user-456',
    ticketTypeId: 'lote-789',
    quantity: 2,
    unitPrice: 75.5,
    totalPrice: 151,
    status: OrderStatus.PAID,
    createdAt: baseDate,
    updatedAt: baseDate,
   });


   expect(typeof result.unitPrice).toBe('number');
   expect(typeof result.totalPrice).toBe('number');
  });
 });

 describe('toResponseList', () => {
  it('deve mapear um array de entidades para um array de DTOs', () => {

   const mockOrders = [
    { id: '1', quantity: 1, unitPrice: '50', totalPrice: '50' },
    { id: '2', quantity: 2, unitPrice: '20.5', totalPrice: '41' },
   ] as any[];


   const result = OrderMapper.toResponseList(mockOrders);


   expect(result).toHaveLength(2);
   expect(result[0].id).toBe('1');
   expect(result[0].totalPrice).toBe(50);
   expect(result[1].id).toBe('2');
   expect(result[1].totalPrice).toBe(41);
  });

  it('deve retornar um array vazio se a entrada for um array vazio', () => {
   const result = OrderMapper.toResponseList([]);
   expect(result).toEqual([]);
  });
 });
});