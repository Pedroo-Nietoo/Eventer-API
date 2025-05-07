import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

/**
 * Data Transfer Object (DTO) for updating an event.
 *
 * This class extends a partial type of CreateEventDto, allowing for partial updates to an event's information.
 *
 * @extends PartialType
 * @see CreateEventDto
 */
export class UpdateEventDto extends PartialType(OmitType(CreateEventDto, ['userOwnerId'] as const)) { }
