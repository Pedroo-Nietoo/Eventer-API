import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UserResponseDto } from '@users/dto/user-response.dto';
import { UserMapper } from '@users/mappers/user.mapper';
import { UsersRepository } from '@users/repository/users.repository';
import { UserRole } from '@common/enums/role.enum';
import { DatabaseError } from '@common/interfaces/database-error.interface';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const role = dto.role || UserRole.USER;
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.usersRepository.create({
        ...dto,
        role,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(user);

      return UserMapper.toResponse(savedUser);
    } catch (error: unknown) {
      const dbError = error as DatabaseError;

      if (dbError.code === '23505' || dbError.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Este e-mail já está em uso.');
      }

      this.logger.error('Erro ao criar usuário', error);

      throw new InternalServerErrorException(
        'Erro interno ao tentar criar o usuário.',
      );
    }
  }
}
