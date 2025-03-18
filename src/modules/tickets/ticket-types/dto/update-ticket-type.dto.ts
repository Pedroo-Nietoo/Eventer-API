import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTicketTypeDto } from './create-ticket-type.dto';

/**
 * Data Transfer Object (DTO) for updating an ticket type.
 *
 * This class extends a partial type of CreateTicketTypeDto, omitting the 'eventId' property.
 * It allows for partial updates to an event ticket type's information.
 *
 * @extends PartialType
 * @see CreateTicketTypeDto
 */
export class UpdateTicketTypeDto extends PartialType(
  OmitType(CreateTicketTypeDto, ['eventId'] as const),
) {}
