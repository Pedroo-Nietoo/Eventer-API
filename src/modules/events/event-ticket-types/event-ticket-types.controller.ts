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
import { EventTicketTypesService } from './event-ticket-types.service';
import { CreateEventTicketTypeDto } from './dto/create-event-ticket-type.dto';
import { UpdateEventTicketTypeDto } from './dto/update-event-ticket-type.dto';

/**
 * Controller for handling event ticket types.
 */
@Controller('event-ticket-types')
export class EventTicketTypesController {
  /**
   * Constructs a new instance of EventTicketTypesController.
   * @param eventTicketTypesService - The service to handle event ticket types.
   */
  constructor(
    private readonly eventTicketTypesService: EventTicketTypesService,
  ) {}

  /**
   * Creates a new event ticket type.
   * @param createEventTicketTypeDto - The DTO containing the details of the event ticket type to create.
   * @returns The created event ticket type.
   */
  @Post()
  create(@Body() createEventTicketTypeDto: CreateEventTicketTypeDto) {
    return this.eventTicketTypesService.create(createEventTicketTypeDto);
  }

  /**
   * Retrieves all event ticket types.
   * @param page - The page number for pagination (default is 1).
   * @returns A list of event ticket types.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.eventTicketTypesService.findAll(page);
  }

  /**
   * Retrieves a specific event ticket type by ID.
   * @param id - The ID of the event ticket type to retrieve.
   * @returns The event ticket type with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTicketTypesService.findOne(id);
  }

  /**
   * Updates a specific event ticket type by ID.
   * @param id - The ID of the event ticket type to update.
   * @param updateEventTicketTypeDto - The DTO containing the updated details of the event ticket type.
   * @returns The updated event ticket type.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventTicketTypeDto: UpdateEventTicketTypeDto,
  ) {
    return this.eventTicketTypesService.update(id, updateEventTicketTypeDto);
  }

  /**
   * Deletes a specific event ticket type by ID.
   * @param id - The ID of the event ticket type to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTicketTypesService.remove(id);
  }
}
