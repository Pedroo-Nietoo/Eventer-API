import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const saltRounds: number = 10;
      const hashedPassword: string = await bcrypt.hash(createUserDto.password, saltRounds);

      const user = this.repository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.repository.save(user);
      const { password, ...result } = savedUser;

      return result;

    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Este e-mail já está em uso.');
      }

      this.logger.error('Erro ao criar usuário:', error);
      throw new InternalServerErrorException('Erro interno ao tentar criar o usuário.');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const skip = (page - 1) * limit;

    const [users, total] = await this.repository.findAndCount({
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        role: true,
        tickets: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        tickets: true,
      },
      skip: skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: users,
      meta: {
        totalItems: total,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.repository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        role: true,
        tickets: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        tickets: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.repository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (Object.keys(updateUserDto).length === 0) {
      return this.findOne(id);
    }

    try {
      const updateResult = await this.repository.update(id, updateUserDto);

      if (updateResult.affected === 0) {
        throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
      }

      return await this.findOne(id);

    } catch (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Este e-mail já está em uso por outro usuário.');
      }

      this.logger.error('Erro ao atualizar usuário:', error);
      throw new InternalServerErrorException('Erro interno ao atualizar o usuário.');
    }
  }

  async remove(id: string) {
    const deleteResult = await this.repository.softDelete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Usuário com o ID ${id} não encontrado.`);
    }
  }
}
