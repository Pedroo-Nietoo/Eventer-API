import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
 constructor(
  @InjectRepository(Order)
  private readonly ordersRepo: Repository<Order>,
 ) {
  super(ordersRepo);
 }

 async updateSessionId(orderId: string, sessionId: string): Promise<void> {
  await this.ordersRepo.update(orderId, { stripeSessionId: sessionId });
 }

 async findBySessionId(sessionId: string): Promise<Order | null> {
  return this.ordersRepo.findOne({
   where: { stripeSessionId: sessionId },
   relations: ['user', 'ticketType', 'ticketType.event']
  });
 }

 async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
  await this.ordersRepo.update(orderId, { status });
 }
}