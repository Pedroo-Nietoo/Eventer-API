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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Exclude, Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Controller for handling event-related operations.
 */
// @Roles(Exclude(Role.USER)) //todo fix this for the GET method
@Controller('events')
export class EventsController {
  /**
   * Constructs a new EventsController.
   * @param eventsService - The service used to manage events.
   */
  constructor(private readonly eventsService: EventsService) { }

  /**
   * Creates a new event.
   * @param createEventDto - The data transfer object containing event details.
   * @returns The created event.
   */
  @Roles(Exclude(Role.EVENT_EMPLOYEE))
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
   * Finds nearby events based on the provided user ID and distance.
   * @param id - The ID of the user for whom nearby events are being searched.
   * @param distance - The maximum distance (in meters) to search for nearby events. Defaults to 500 meters.
   * @returns A list of events within the specified distance from the user.
  */
  @Get(':id/nearby')
  findNearby(@Param('id') id: string, @Query('distance') distance: number = 500) {
    return this.eventsService.findNearby(id, distance);
  }

  /**
   * Updates an existing event by its ID.
   * @param id - The ID of the event to update.
   * @param updateEventDto - The data transfer object containing updated event details.
   * @returns The updated event.
   */
  @Roles(Exclude(Role.EVENT_EMPLOYEE))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.eventsService.update(id, updateEventDto, token);
  }

  /**
   * Removes an event by its ID.
   * @param id - The ID of the event to remove.
   * @returns A confirmation message.
   */
  @Roles(Exclude(Role.EVENT_EMPLOYEE))
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.eventsService.remove(id, token);
  }
}
