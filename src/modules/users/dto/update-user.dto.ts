import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * Data Transfer Object (DTO) for updating a user.
 *
 * This class extends a partial type of CreateUserDto, omitting the 'birthDate' and 'role' properties.
 * It allows for partial updates to a user's information.
 *
 * @extends PartialType
 * @see CreateUserDto
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['birthDate', 'role'] as const),
) {}
