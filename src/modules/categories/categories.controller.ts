import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * CategoriesController handles the CRUD operations for categories.
 */
@Controller('categories')
export class CategoriesController {
  /**
   * Creates an instance of CategoriesController.
   * @param categoriesService - The service used to manage categories.
   */
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Creates a new category.
   * @param createCategoryDto - The data transfer object containing the details of the category to create.
   * @returns The created category.
   */
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Retrieves all categories, optionally paginated.
   * @param page - The page number to retrieve, defaults to 1.
   * @returns A list of categories.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.categoriesService.findAll(page);
  }

  /**
   * Retrieves a single category by its ID.
   * @param id - The ID of the category to retrieve.
   * @returns The category with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Updates a category by its ID.
   * @param id - The ID of the category to update.
   * @param updateCategoryDto - The data transfer object containing the updated details of the category.
   * @returns The updated category.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
