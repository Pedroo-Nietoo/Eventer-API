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
import { DatabaseError } from '@common/interfaces/database-error.interface';

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(private readonly usersRepository: UsersRepository) { }

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);

    if (this.isDtoEmpty(dto)) {
      return UserMapper.toResponse(user);
    }

    try {
      await this.applyUpdates(user, dto);
      const savedUser = await this.usersRepository.save(user);
      return UserMapper.toResponse(savedUser);
    } catch (error) {
      this.handlePersistenceError(error, id);
    }
  }

  private async getUserOrThrow(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
    }
    return user;
  }

  private isDtoEmpty(dto: UpdateUserDto): boolean {
    return !dto || Object.keys(dto).length === 0;
  }

  private async applyUpdates(user: any, dto: UpdateUserDto): Promise<void> {
    const { password, ...updateData } = dto;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    Object.assign(user, updateData);
  }

  private handlePersistenceError(error: unknown, id: string): never {
    const dbError = error as DatabaseError;
    const conflictCodes = ['23505', 'ER_DUP_ENTRY'];

    if (dbError.code && conflictCodes.includes(dbError.code)) {
      throw new ConflictException('Este e-mail já está em uso por outro usuário.');
    }

    this.logger.error(
      `Erro ao atualizar usuário ID=${id}`,
      dbError.stack ?? 'Sem stack trace',
    );

    throw new InternalServerErrorException('Erro interno ao atualizar o usuário.');
  }
}