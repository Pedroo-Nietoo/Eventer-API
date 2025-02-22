import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEventTicketTypeDto } from './create-event-ticket-type.dto';

export class UpdateEventTicketTypeDto extends PartialType(
  OmitType(CreateEventTicketTypeDto, ['eventId'] as const),
) {}
