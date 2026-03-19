import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repository/orders.repository';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderMapper } from '../mappers/order.mapper';
import { UserRole } from 'src/common/enums/role.enum';

@Injectable()
export class FindOrderUseCase {
 constructor(private readonly ordersRepository: OrdersRepository) { }

 async execute(id: string, userId: string, userRole: UserRole): Promise<OrderResponseDto> {
  const order = await this.ordersRepository.findById(id);

  if (!order) throw new NotFoundException('Pedido não encontrado.');

  if (order.userId !== userId && userRole !== UserRole.ADMIN) {
   throw new ForbiddenException('Acesso negado a este pedido.');
  }

  return OrderMapper.toResponse(order);
 }
}