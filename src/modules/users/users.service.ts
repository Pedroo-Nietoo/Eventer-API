import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (user) {
        throw new ConflictException(
          'User with the specified email already exists',
          'User already exists',
        );
      }

      const hashedPassword: string = await this.hashPassword(
        createUserDto.password,
      );
      createUserDto.password = hashedPassword;

      await this.prismaService.user.create({
        data: {
          ...createUserDto,
          birthDate: new Date(createUserDto.birthDate),
        },
      });

      return { message: 'User created successfully', status: 201 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(page: number) {
    try {
      const pageSize = 25;
      const users = await this.prismaService.user.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { users };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(
          'User with the specified ID was not found',
          'User not found',
        );
      }

      return { user };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    //TODO validate user password before updating
    try {
      if (!Object.keys(updateUserDto).length) {
        return { message: 'No data to update', status: 200 };
      }

      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(
          'User with the specified ID was not found',
          'User not found',
        );
      }

      if (updateUserDto.password) {
        const hashedPassword: string = await this.hashPassword(
          updateUserDto.password,
        );
        updateUserDto.password = hashedPassword;
      }

      await this.prismaService.user.update({
        where: { id },
        data: {
          ...updateUserDto,
        },
      });

      return { message: 'User updated successfully', status: 200 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(
          'User with the specified ID was not found',
          'User not found',
        );
      }

      await this.prismaService.user.delete({
        where: { id },
      });

      return { message: 'User deleted successfully', status: 204 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword: string = await bcrypt.hash(
        password,
        bcrypt.genSaltSync(10),
      );
      return hashedPassword;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
