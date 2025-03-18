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
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

/**
 * Controller for handling ticket types.
 */
@Controller('ticket-types')
export class TicketTypesController {
  /**
   * Constructs a new instance of EventTicketTypesController.
   * @param ticketTypesService - The service to handle event ticket types.
   */
  constructor(
    private readonly ticketTypesService: TicketTypesService,
  ) {}

  /**
   * Creates a new ticket type.
   * @param createTicketTypeDto - The DTO containing the details of the ticket type to create.
   * @returns The created ticket type.
   */
  @Post()
  create(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.ticketTypesService.create(createTicketTypeDto);
  }

  /**
   * Retrieves all event ticket types.
   * @param page - The page number for pagination (default is 1).
   * @returns A list of event ticket types.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.ticketTypesService.findAll(page);
  }

  /**
   * Retrieves a specific event ticket type by ID.
   * @param id - The ID of the event ticket type to retrieve.
   * @returns The event ticket type with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketTypesService.findOne(id);
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
    @Body() updateEventTicketTypeDto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypesService.update(id, updateEventTicketTypeDto);
  }

  /**
   * Deletes a specific event ticket type by ID.
   * @param id - The ID of the event ticket type to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketTypesService.remove(id);
  }
}
