import { Injectable } from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { UsersRepository } from '@users/repository/users.repository';
import { UserResponseDto } from '@users/dto/user-response.dto';
import { UserMapper } from '@users/mappers/user.mapper';
import { FindOptionsOrder } from 'typeorm';
import { User } from '@users/entities/user.entity';

@Injectable()
export class ListUsersUseCase {
 constructor(private readonly usersRepository: UsersRepository) { }

 async execute(
  paginationDto: PaginationDto,
 ): Promise<PaginatedResponse<UserResponseDto>> {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  const order: FindOptionsOrder<User> = { createdAt: 'DESC' };

  const [users, total] = await this.usersRepository.findAndCount({
   skip,
   take: limit,
   order,
  });

  return {
   data: UserMapper.toResponseList(users),
   meta: {
    totalItems: total,
    itemCount: users.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
   },
  };
 }
}