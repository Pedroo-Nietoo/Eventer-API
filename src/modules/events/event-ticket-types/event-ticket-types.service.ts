/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventTicketTypeDto } from './dto/create-event-ticket-type.dto';
import { UpdateEventTicketTypeDto } from './dto/update-event-ticket-type.dto';
import { PrismaService } from '@src/database/prisma/prisma.service';
import { EventsService } from '../events.service';

/**
 * Service responsible for managing event ticket types.
 */
@Injectable()
export class EventTicketTypesService {
  /**
   * Constructs an instance of EventTicketTypesService.
   * @param prismaService - The Prisma service for database operations.
   * @param eventsService - The service for managing events.
   */
  constructor(
    private readonly prismaService: PrismaService,
    private eventsService: EventsService,
  ) {}

  /**
   * Creates a new event ticket type.
   * @param createEventTicketTypeDto - The data transfer object containing the details of the event ticket type to create.
   * @returns A success message and status code.
   * @throws NotFoundException if the event with the specified ID is not found.
   */
  async create(createEventTicketTypeDto: CreateEventTicketTypeDto) {
    const event = await this.prismaService.event.findUnique({
      where: { id: createEventTicketTypeDto.eventId },
    });

    if (!event) {
      throw new NotFoundException(
        'Event with the specified ID was not found',
        'Event not found',
      );
    }

    await this.prismaService.eventTicketType.create({
      data: {
        ...createEventTicketTypeDto,
      },
    });

    return {
      message: 'Custom event ticket type created successfully.',
      status: 201,
    };
  }

  /**
   * Retrieves all event ticket types with pagination.
   * @param page - The page number for pagination.
   * @returns An object containing the list of event ticket types.
   * @throws InternalServerErrorException if an error occurs during the retrieval.
   */
  async findAll(page: number) {
    try {
      const pageSize = 25;
      const eventTicketTypes =
        await this.prismaService.eventTicketType.findMany({
          take: page === 0 ? undefined : pageSize,
          skip: page > 0 ? (page - 1) * pageSize : 0,
        });

      return { eventTicketTypes };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Retrieves a single event ticket type by its ID.
   * @param id - The ID of the event ticket type to retrieve.
   * @returns An object containing the event ticket type.
   * @throws NotFoundException if the event ticket type with the specified ID is not found.
   * @throws InternalServerErrorException if an error occurs during the retrieval.
   */
  async findOne(id: string) {
    try {
      const eventTicketType =
        await this.prismaService.eventTicketType.findUnique({
          where: { id },
        });

      if (!eventTicketType) {
        throw new NotFoundException(
          'Custom event ticket type with the specified ID was not found',
          'Custom event ticket type not found',
        );
      }

      return { eventTicketType };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Updates an existing event ticket type.
   * @param id - The ID of the event ticket type to update.
   * @param updateEventTicketTypeDto - The data transfer object containing the updated details of the event ticket type.
   * @returns A success message and status code.
   * @throws NotFoundException if the event ticket type with the specified ID is not found.
   */
  async update(id: string, updateEventTicketTypeDto: UpdateEventTicketTypeDto) {
    const eventTicketType = await this.prismaService.eventTicketType.findUnique(
      {
        where: { id },
      },
    );

    if (!eventTicketType) {
      throw new NotFoundException(
        'Custom event ticket type with the specified ID was not found',
        'Custom event ticket type not found',
      );
    }

    if (updateEventTicketTypeDto.ticketCount) {
      await this.eventsService.updateEventAvaliableTickets(
        eventTicketType.eventId,
        {
          previousValue: eventTicketType.ticketCount,
          newValue: updateEventTicketTypeDto.ticketCount,
        },
      );
    }

    await this.prismaService.eventTicketType.update({
      where: { id },
      data: {
        ...updateEventTicketTypeDto,
      },
    });

    return {
      message: 'Custom event ticket type updated successfully.',
      status: 200,
    };
  }

  /**
   * Deletes an event ticket type by its ID.
   * @param id - The ID of the event ticket type to delete.
   * @returns A success message and status code.
   * @throws NotFoundException if the event ticket type with the specified ID is not found.
   */
  async remove(id: string) {
    const eventTicketType = await this.prismaService.eventTicketType.findUnique(
      {
        where: { id },
      },
    );

    if (!eventTicketType) {
      throw new NotFoundException(
        'Custom event ticket type with the specified ID was not found',
        'Custom event ticket type not found',
      );
    }

    await this.prismaService.eventTicketType.delete({
      where: { id },
    });

    return {
      message: 'Custom Custom event ticket type deleted successfully.',
      status: 204,
    };
  }

  /**
   * Updates the available tickets count for an event ticket type.
   * @param eventTicketTypeId - The ID of the event ticket type to update.
   * @returns A success message and status code.
   * @throws NotFoundException if the event ticket type with the specified ID is not found.
   * @throws ConflictException if no tickets are available for the specified type.
   */
  async updateEventTicketTypeAvaliableTickets(eventTicketTypeId: string) {
    const eventTicketType = await this.prismaService.eventTicketType.findUnique(
      {
        where: { id: eventTicketTypeId },
      },
    );

    if (!eventTicketType) {
      throw new NotFoundException(
        'Custom event ticket type with the specified ID was not found',
        'Custom event ticket type not found',
      );
    }

    if (eventTicketType.ticketCount <= 0) {
      throw new ConflictException(
        'No tickets available for this type',
        'No tickets available',
      );
    }

    await this.prismaService.event.update({
      where: { id: eventTicketTypeId },
      data: {
        ticketCount: eventTicketType.ticketCount - 1,
      },
    });

    return {
      message: 'Custom event ticket type count updated successfully',
      status: 200,
    };
  }
}
