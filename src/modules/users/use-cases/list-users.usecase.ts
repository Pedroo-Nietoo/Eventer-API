import { Injectable } from '@nestjs/common';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { UsersRepository } from '../repository/users.repository';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class ListUsersUseCase {
 constructor(private readonly usersRepository: UsersRepository) { }

 async execute(
  paginationDto: PaginationDto,
 ): Promise<PaginatedResponse<UserResponseDto>> {
  const { page = 1, limit = 20 } = paginationDto;

  const skip = (page - 1) * limit;

  const users = await this.usersRepository.findAll(skip, limit);
  const total = await this.usersRepository.count();

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