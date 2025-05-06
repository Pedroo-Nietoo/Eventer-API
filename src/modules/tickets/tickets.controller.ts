import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
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
  constructor(private readonly ticketsService: TicketsService) { }

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
   * Marks a ticket as used based on the provided ticket ID.
   * 
   * @param id - The unique identifier of the ticket to be marked as used.
   * @returns A promise or result indicating the success or failure of the operation.
  */
  @Get(':id/mark-as-used')
  markAsUsed(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.ticketsService.markAsUsed(id, token);
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
