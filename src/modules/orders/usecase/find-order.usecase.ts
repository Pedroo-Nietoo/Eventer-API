import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repository/orders.repository';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class FindOrderUseCase {
 constructor(private readonly ordersRepository: OrdersRepository) { }

 async execute(id: string): Promise<OrderResponseDto> {
  const order = await this.ordersRepository.findById(id);

  if (!order) {
   throw new NotFoundException(`Pedido com o ID ${id} não encontrado.`);
  }

  return OrderMapper.toResponse(order);
 }
}