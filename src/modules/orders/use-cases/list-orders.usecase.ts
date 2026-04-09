import { Injectable } from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { OrderResponseDto } from '@orders/dto/order-response.dto';
import { OrderMapper } from '@orders/mappers/order.mapper';

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