import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import { UserResponseDto } from '@users/dto/user-response.dto';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
    }

    return UserMapper.toResponse(user);
  }
}
