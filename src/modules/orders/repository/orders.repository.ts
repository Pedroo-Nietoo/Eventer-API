import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
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

 async createOrder(data: Partial<Order>, manager?: EntityManager): Promise<Order> {
  const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
  const order = repo.create(data);
  return await repo.save(order);
 }

 async updateSessionId(orderId: string, sessionId: string, manager?: EntityManager): Promise<void> {
  const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
  await repo.update(orderId, { stripeSessionId: sessionId });
 }

 async findBySessionId(sessionId: string): Promise<Order | null> {
  return this.ordersRepo.findOne({
   where: { stripeSessionId: sessionId },
   relations: ['user', 'ticketType', 'ticketType.event']
  });
 }

 async updateStatus(orderId: string, status: OrderStatus, manager?: EntityManager): Promise<void> {
  const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
  await repo.update(orderId, { status });
 }
}