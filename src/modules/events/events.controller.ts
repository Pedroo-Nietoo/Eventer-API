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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Controller for handling event-related operations.
 */
@Controller('events')
export class EventsController {
  /**
   * Constructs a new EventsController.
   * @param eventsService - The service used to manage events.
   */
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Creates a new event.
   * @param createEventDto - The data transfer object containing event details.
   * @returns The created event.
   */
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Retrieves a paginated list of all events, optionally filtered by category ID.
   * @param page - The page number to retrieve (default is 1).
   * @param categoryId - The optional category ID to filter events by.
   * @returns A paginated list of events.
   */
  @Public()
  @Get()
  findAll(@Query('page') page: number = 1, @Query('categoryId') categoryId?: string) {
    return this.eventsService.findAll(page, categoryId);
  }

  /**
   * Retrieves a single event by its ID.
   * @param id - The ID of the event to retrieve.
   * @returns The event with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  /**
   * Updates an existing event by its ID.
   * @param id - The ID of the event to update.
   * @param updateEventDto - The data transfer object containing updated event details.
   * @returns The updated event.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * Removes an event by its ID.
   * @param id - The ID of the event to remove.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
