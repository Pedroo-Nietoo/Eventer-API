import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@database/prisma/prisma.service';

/**
 * Service responsible for handling category-related operations.
 */
@Injectable()
export class CategoriesService {
  /**
   * Constructs a new instance of CategoriesService.
   * @param prismaService - The Prisma service used for database operations.
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new category.
   * @param createCategoryDto - The data transfer object containing category details.
   * @returns A success message and status code.
   * @throws ConflictException if a category with the specified name already exists.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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

  /**
   * Retrieves all categories with pagination.
   * @param page - The page number for pagination.
   * @returns An object containing the list of categories.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async findAll(page: number) {
    try {
      const pageSize = 25;
      const categories = await this.prismaService.category.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { categories };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a category by its ID.
   * @param id - The ID of the category to retrieve.
   * @returns An object containing the category details.
   * @throws NotFoundException if the category with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a category by its ID.
   * @param id - The ID of the category to update.
   * @param updateCategoryDto - The data transfer object containing updated category details.
   * @returns A success message and status code.
   * @throws NotFoundException if the category with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   * @returns A success message and status code.
   * @throws NotFoundException if the category with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
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
      throw new InternalServerErrorException(error.message);
    }
  }
}
