import {
 Injectable,
 InternalServerErrorException,
 Logger,
 NotFoundException,
} from '@nestjs/common';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrdersRepository } from '../repository/orders.repository';
import { OrderMapper } from '../mappers/order.mapper';
import { OrderResponseDto } from '../dto/order-response.dto';

@Injectable()
export class UpdateOrderUseCase {
 private readonly logger = new Logger(UpdateOrderUseCase.name);

 constructor(private readonly ordersRepository: OrdersRepository) { }

 async execute(id: string, dto: UpdateOrderDto): Promise<OrderResponseDto> {
  const order = await this.ordersRepository.findById(id);

  if (!order) {
   throw new NotFoundException(`Pedido com o ID ${id} não encontrado.`);
  }

  if (!dto || Object.keys(dto).length === 0) {
   return OrderMapper.toResponse(order);
  }

  try {
   Object.assign(order, dto);

   const savedOrder = await this.ordersRepository.save(order);

   return OrderMapper.toResponse(savedOrder);
  } catch (error) {
   this.logger.error(`Erro ao atualizar pedido ID=${id}`, error.stack);

   throw new InternalServerErrorException(
    'Erro interno ao atualizar o pedido.',
   );
  }
 }
}