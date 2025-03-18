import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import generateSlug from '@utils/generate-slug';

/**
 * Service responsible for handling event-related operations.
 */
@Injectable()
export class EventsService {
  /**
   * Constructs an instance of EventsService.
   * @param prismaService - The Prisma service used for database operations.
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new event.
   * @param createEventDto - The data transfer object containing event details.
   * @returns A message indicating the event was created successfully.
   * @throws ConflictException if an event with the specified slug already exists.
   * @throws NotFoundException if the specified category ID does not exist.
   * @throws ConflictException if the ticket default price is not provided when custom tickets are not used.
   * @throws InternalServerErrorException if an error occurs during the creation process.
   */
  async create(createEventDto: CreateEventDto) {
    try {
      const slug = generateSlug(createEventDto.name);
      createEventDto.slug = slug;

      const event = await this.prismaService.event.findUnique({
        where: { slug: createEventDto.slug },
      });

      if (event) {
        throw new ConflictException(
          'Event with the specified slug already exists',
          'Event already exists',
        );
      }

      if (createEventDto.categoryId) {
        const category = await this.prismaService.category.findUnique({
          where: { id: createEventDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(
            'Category with the specified ID was not found',
            'Category not found',
          );
        }
      }

      if (!createEventDto.customTickets) {
        if (!createEventDto.ticketDefaultPrice) {
          throw new ConflictException(
            'Ticket default price is required',
            'Ticket default price required',
          );
        }
      }

      await this.prismaService.event.create({
        data: {
          ...createEventDto,
          date: new Date(createEventDto.date),
        },
      });

      return { message: 'Event created successfully', status: 201 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a paginated list of all events.
   * @param page - The page number for pagination.
   * @returns An object containing the list of events.
   * @throws InternalServerErrorException if an error occurs during the retrieval process.
   */
  async findAll(page: number, categoryId?: string) {
    try {
      const pageSize = 25;
      const events = await this.prismaService.event.findMany({
        where: categoryId ? { categoryId } : undefined,
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { events };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a single event by its ID.
   * @param id - The ID of the event to retrieve.
   * @returns An object containing the event details.
   * @throws NotFoundException if the event with the specified ID does not exist.
   * @throws InternalServerErrorException if an error occurs during the retrieval process.
   */
  async findOne(id: string) {
    try {
      const event = await this.prismaService.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException(
          'Event with the specified ID was not found',
          'Event not found',
        );
      }

      return { event };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates an existing event.
   * @param id - The ID of the event to update.
   * @param updateEventDto - The data transfer object containing updated event details.
   * @returns A message indicating the event was updated successfully.
   * @throws NotFoundException if the event with the specified ID does not exist.
   * @throws NotFoundException if the specified category ID does not exist.
   * @throws ConflictException if an event with the specified slug already exists.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(id: string, updateEventDto: UpdateEventDto) {
    try {
      if (!Object.keys(updateEventDto).length) {
        return { message: 'No data to update', status: 200 };
      }

      const event = await this.prismaService.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException(
          'Event with the specified ID was not found',
          'Event not found',
        );
      }

      if (updateEventDto.categoryId) {
        const category = await this.prismaService.category.findUnique({
          where: { id: updateEventDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(
            'Category with the specified ID was not found',
            'Category not found',
          );
        }
      }

      if (updateEventDto.name && updateEventDto.name !== event.name) {
        const slug = generateSlug(updateEventDto.name);

        const event = await this.prismaService.event.findUnique({
          where: { slug },
        });

        if (event) {
          throw new ConflictException(
            'Event with the specified slug already exists',
            'Event already exists',
          );
        }

        updateEventDto.slug = slug;
      }

      await this.prismaService.event.update({
        where: { id },
        data: {
          ...updateEventDto,
        },
      });

      return { message: 'Event updated successfully', status: 200 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes an event by its ID.
   * @param id - The ID of the event to delete.
   * @returns A message indicating the event was deleted successfully.
   * @throws NotFoundException if the event with the specified ID does not exist.
   * @throws InternalServerErrorException if an error occurs during the deletion process.
   */
  async remove(id: string) {
    try {
      const event = await this.prismaService.event.findUnique({
        where: { id },
      });

      if (!event) {
        throw new NotFoundException(
          'Event with the specified ID was not found',
          'Event not found',
        );
      }

      await this.prismaService.event.delete({
        where: { id },
      });

      return { message: 'Event deleted successfully', status: 204 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates the available ticket count for an event.
   * @param eventId - The ID of the event to update.
   * @param customEventTicket - An optional object containing the previous and new ticket values.
   * @returns A message indicating the ticket count was updated successfully.
   * @throws NotFoundException if the event with the specified ID does not exist.
   * @throws ConflictException if no tickets are available for the event.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async updateEventAvaliableTickets(
    eventId: string,
    customEventTicket: {
      previousValue: number;
      newValue: number;
    } | null = null,
  ) {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(
        'Event with the specified ID was not found',
        'Event not found',
      );
    }

    if (event.ticketCount <= 0) {
      throw new ConflictException(
        'No tickets available for this event',
        'No tickets available',
      );
    }

    if (customEventTicket && customEventTicket.newValue !== 0) {
      const newTicketCountValue =
        event.ticketCount -
        customEventTicket.previousValue +
        customEventTicket.newValue;

      await this.prismaService.event.update({
        where: { id: eventId },
        data: {
          ticketCount: newTicketCountValue,
        },
      });
    } else {
      await this.prismaService.event.update({
        where: { id: eventId },
        data: {
          ticketCount: event.ticketCount - 1,
        },
      });
    }

    return { message: 'Ticket count updated successfully', status: 200 };
  }
}
