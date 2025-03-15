import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEventTicketTypeDto } from './create-event-ticket-type.dto';

/**
 * Data Transfer Object (DTO) for updating an event ticket type.
 *
 * This class extends a partial type of CreateEventTicketTypeDto, omitting the 'eventId' property.
 * It allows for partial updates to an event ticket type's information.
 *
 * @extends PartialType
 * @see CreateEventTicketTypeDto
 */
export class UpdateEventTicketTypeDto extends PartialType(
  OmitType(CreateEventTicketTypeDto, ['eventId'] as const),
) {}
