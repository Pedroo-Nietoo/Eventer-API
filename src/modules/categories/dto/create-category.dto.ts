import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a category.
 */
export class CreateCategoryDto {
  /**
   * The name of the category.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  name: string;
}
