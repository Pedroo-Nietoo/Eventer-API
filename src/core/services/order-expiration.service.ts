import { Injectable, Logger } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { Order } from '../../modules/orders/entities/order.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { TicketTypesRepository } from '../../modules/ticket-types/repository/ticket-type.repository';

@Injectable()
export class OrderExpirationService {
 private readonly logger = new Logger(OrderExpirationService.name);

 constructor(
  private readonly dataSource: DataSource,
  private readonly ticketTypesRepository: TicketTypesRepository
 ) { }

 async execute(): Promise<void> {
  const limit = new Date();
  limit.setMinutes(limit.getMinutes() - 1);

  const expiredOrders = await this.dataSource.getRepository(Order).find({
   where: { status: OrderStatus.PENDING, createdAt: LessThan(limit) },
   take: 50
  });

  for (const order of expiredOrders) {
   await this.dataSource.transaction(async (manager) => {
    const result = await manager.update(Order,
     { id: order.id, status: OrderStatus.PENDING },
     { status: OrderStatus.CANCELLED }
    );

    if (result.affected && result.affected > 0) {
     await this.ticketTypesRepository.incrementStock(order.ticketTypeId, order.quantity, manager);
     this.logger.log(`Pedido ${order.id} expirado. Estoque devolvido.`);
    }
   });
  }
 }
}