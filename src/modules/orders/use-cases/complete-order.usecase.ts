import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@common/enums/order-status.enum';
import { CreateTicketUseCase } from '@tickets/use-cases/create-ticket.usecase';
import { DataSource } from 'typeorm';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { OrdersRepository } from '@orders/repository/orders.repository';

@Injectable()
export class CompleteOrderUseCase {
 private readonly logger = new Logger(CompleteOrderUseCase.name);

 constructor(
  private readonly ordersRepository: OrdersRepository,
  private readonly dataSource: DataSource,
  private readonly createTicketUseCase: CreateTicketUseCase,
 ) { }

 async execute(orderId: string): Promise<void> {
  const order = await this.ordersRepository.findById(orderId);

  if (!order || order.status !== OrderStatus.PENDING) {
   this.logger.warn(`Pedido ${orderId} ignorado (Status atual: ${order?.status})`);
   return;
  }
  await this.ordersRepository.updateStatus(orderId, OrderStatus.PAID);
  this.logger.log(`Status do pedido ${orderId} atualizado para PAID.`);

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();

  let ticketType: TicketType | null = null;

  try {
   ticketType = await queryRunner.manager.findOne<TicketType>(TicketType, {
    where: { id: order.ticketTypeId },
    relations: { event: true },
    select: {
     event: { id: true }
    },
   });
  } finally {
   await queryRunner.release();
  }

  if (!ticketType) {
   throw new NotFoundException('Lote de ingressos não encontrado para emitir o bilhete.');
  }

  const eventId = ticketType.event.id;

  for (let i = 0; i < order.quantity; i++) {
   try {
    await this.createTicketUseCase.execute(
     {
      ticketTypeId: order.ticketTypeId,
      eventId: eventId
     },
     order.userId
    );
   } catch (error: unknown) {
    this.logger.error(`Erro ao emitir o ingresso ${i + 1} de ${order.quantity} para o pedido ${orderId}`, error);
   }
  }

  this.logger.log(`Processo de emissão finalizado para o pedido ${orderId}.`);
 }
}