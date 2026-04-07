import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '@common/enums/order-status.enum';
import { Order } from '@orders/entities/order.entity';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { DataSource, LessThan } from 'typeorm';

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