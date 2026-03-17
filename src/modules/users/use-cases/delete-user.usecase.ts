import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class DeleteUserUseCase {
 constructor(private readonly usersRepository: UsersRepository) { }

 async execute(id: string): Promise<void> {
  const result = await this.usersRepository.softDelete(id);

  if (result.affected === 0) {
   throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
  }
 }
}