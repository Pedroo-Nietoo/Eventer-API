import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseRepository } from '@common/repository/base.repository';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Order } from '@orders/entities/order.entity';

@Injectable()
export class OrdersRepository extends BaseRepository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {
    super(ordersRepo);
  }

  async createOrder(
    data: Partial<Order>,
    manager?: EntityManager,
  ): Promise<Order> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
    const order = repo.create(data);
    return await repo.save(order);
  }

  async updateSessionId(
    orderId: string,
    sessionId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
    await repo.update(orderId, { stripeSessionId: sessionId });
  }

  async findBySessionId(sessionId: string): Promise<Order | null> {
    return this.ordersRepo.findOne({
      where: { stripeSessionId: sessionId },
      relations: ['user', 'ticketType', 'ticketType.event'],
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Order) : this.ordersRepo;
    await repo.update(orderId, { status });
  }
}
