import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';

/**
 * Data Transfer Object (DTO) for updating a ticket.
 *
 * This class extends a partial type of CreateTicketDto, omitting the 'userId' and 'eventId' properties.
 * It allows for partial updates to a ticket's information.
 *
 * @extends PartialType
 * @see CreateTicketDto
 */
export class UpdateTicketDto extends PartialType(
  OmitType(CreateTicketDto, ['userId', 'eventId'] as const),
) {}
