import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Service responsible for handling user-related operations.
 */
@Injectable()
export class UsersService {
  /**
   * Constructs a new instance of UsersService.
   * @param prismaService - The Prisma service used for database operations.
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new user.
   * @param createUserDto - The data transfer object containing user creation details.
   * @returns A message indicating the user was created successfully.
   * @throws ConflictException if a user with the specified email already exists.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a paginated list of users.
   * @param page - The page number to retrieve.
   * @returns An object containing the list of users.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async findAll(page: number) {
    try {
      const pageSize = 25;
      const users = await this.prismaService.user.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
          tickets: true,
        },
      });

      return { users };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns An object containing the user details.
   * @throws NotFoundException if the user with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
          tickets: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          'User with the specified ID was not found',
          'User not found',
        );
      }

      return { user };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a user's details.
   * @param id - The ID of the user to update.
   * @param updateUserDto - The data transfer object containing user update details.
   * @returns A message indicating the user was updated successfully.
   * @throws NotFoundException if the user with the specified ID is not found.
   * @throws UnauthorizedException if the provided password is invalid.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
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

      const isValidPassword = await bcrypt.compare(
        updateUserDto.password,
        user.password,
      );

      if (!isValidPassword) {
        throw new UnauthorizedException(
          'Invalid password provided.',
          'Unauthorized',
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes a user by their ID.
   * @param id - The ID of the user to delete.
   * @returns A message indicating the user was deleted successfully.
   * @throws NotFoundException if the user with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Hashes a password.
   * @param password - The password to hash.
   * @returns The hashed password.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword: string = await bcrypt.hash(
        password,
        bcrypt.genSaltSync(10),
      );
      return hashedPassword;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a user by their email.
   * @param email - The email of the user to retrieve.
   * @returns An object containing the user details.
   * @throws NotFoundException if the user with the specified email is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async findOneByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(
          'User with the specified email was not found',
          'User not found',
        );
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
