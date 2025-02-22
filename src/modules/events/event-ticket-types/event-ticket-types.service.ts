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

@Injectable()
export class EventTicketTypesService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventsService: EventsService,
  ) {}

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
