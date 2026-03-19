import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { OrdersRepository } from '../repository/orders.repository';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class ListOrdersUseCase {
 constructor(private readonly ordersRepository: OrdersRepository) { }

 async execute(
  paginationDto: PaginationDto,
 ): Promise<PaginatedResponse<OrderResponseDto>> {
  const { page = 1, limit = 20 } = paginationDto;

  const skip = (page - 1) * limit;

  const orders = await this.ordersRepository.findAll(skip, limit);
  const total = await this.ordersRepository.count();

  return {
   data: OrderMapper.toResponseList(orders),
   meta: {
    totalItems: total,
    itemCount: orders.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
   },
  };
 }
}