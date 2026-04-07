import {
 ConflictException,
 Injectable,
 InternalServerErrorException,
 Logger,
 NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import { UserResponseDto } from '@users/dto/user-response.dto';

@Injectable()
export class UpdateUserUseCase {
 private readonly logger = new Logger(UpdateUserUseCase.name);

 constructor(private readonly usersRepository: UsersRepository) { }

 async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
  const user = await this.usersRepository.findById(id);

  if (!user) {
   throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
  }

  if (!dto || Object.keys(dto).length === 0) {
   return UserMapper.toResponse(user);
  }

  try {
   const { password, ...updateData } = dto;

   if (password) {
    user.password = await bcrypt.hash(password, 10);
   }

   Object.assign(user, updateData);

   const savedUser = await this.usersRepository.save(user);

   return UserMapper.toResponse(savedUser);
  } catch (error) {
   if (error?.code === '23505' || error?.code === 'ER_DUP_ENTRY') {
    throw new ConflictException(
     'Este e-mail já está em uso por outro usuário.',
    );
   }

   this.logger.error(
    `Erro ao atualizar usuário ID=${id}`,
    error.stack,
   );

   throw new InternalServerErrorException(
    'Erro interno ao atualizar o usuário.',
   );
  }
 }
}