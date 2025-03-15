import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * Data Transfer Object (DTO) for updating a category.
 *
 * This class extends a partial type of CreateCategoryDto.
 * It allows for partial updates to a category's information.
 *
 * @extends PartialType
 * @see CreateCategoryDto
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
