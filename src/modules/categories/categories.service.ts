import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.prismaService.category.findFirst({
        where: { name: createCategoryDto.name },
      });

      if (category) {
        throw new ConflictException(
          'Category with the specified name already exists',
          'Category already exists',
        );
      }

      await this.prismaService.category.create({
        data: createCategoryDto,
      });

      return { message: 'Category created successfully', status: 201 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(page: number) {
    try {
      const pageSize = 25;
      const categories = await this.prismaService.category.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { categories };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(
          'Category with the specified ID was not found',
          'Category not found',
        );
      }

      return { category };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(
          'Category with the specified ID was not found',
          'Category not found',
        );
      }

      await this.prismaService.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      return { message: 'Category updated successfully', status: 200 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException(
          'Category with the specified ID was not found',
          'Category not found',
        );
      }

      await this.prismaService.category.delete({
        where: { id },
      });

      return { message: 'Category deleted successfully', status: 204 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
