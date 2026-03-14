import {
 ConflictException,
 Injectable,
 InternalServerErrorException,
 Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class CreateUserUseCase {
 private readonly logger = new Logger(CreateUserUseCase.name);

 constructor(private readonly usersRepository: UsersRepository) { }

 async execute(dto: CreateUserDto): Promise<UserResponseDto> {
  try {
   const hashedPassword = await bcrypt.hash(dto.password, 10);

   const user = this.usersRepository.create({
    ...dto,
    password: hashedPassword,
   });

   const savedUser = await this.usersRepository.save(user);

   return UserMapper.toResponse(savedUser);
  } catch (error) {
   if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
    throw new ConflictException('Este e-mail já está em uso.');
   }

   this.logger.error('Erro ao criar usuário', error);

   throw new InternalServerErrorException(
    'Erro interno ao tentar criar o usuário.',
   );
  }
 }
}