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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

/**
 * Controller for handling ticket-related operations.
 */
@Controller('tickets')
export class TicketsController {
  /**
   * Creates an instance of TicketsController.
   * @param ticketsService - The service used to manage tickets.
   */
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * Creates a new ticket.
   * @param createTicketDto - The data transfer object containing ticket details.
   * @returns The created ticket.
   */
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  /**
   * Retrieves all tickets with pagination.
   * @param page - The page number for pagination (default is 1).
   * @returns A list of tickets.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.ticketsService.findAll(page);
  }

  /**
   * Retrieves a single ticket by its ID.
   * @param id - The ID of the ticket to retrieve.
   * @returns The ticket with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  /**
   * Updates a ticket by its ID.
   * @param id - The ID of the ticket to update.
   * @param updateTicketDto - The data transfer object containing updated ticket details.
   * @returns The updated ticket.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  /**
   * Deletes a ticket by its ID.
   * @param id - The ID of the ticket to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
