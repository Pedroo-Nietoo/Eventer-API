import { Injectable, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../repository/orders.repository';

@Injectable()
export class DeleteOrderUseCase {
 constructor(private readonly ordersRepository: OrdersRepository) { }

 async execute(id: string): Promise<void> {
  const result = await this.ordersRepository.softDelete(id);

  if (result.affected === 0) {
   throw new NotFoundException(`Pedido com o ID ${id} não encontrado.`);
  }
 }
}