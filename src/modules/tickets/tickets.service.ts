import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '@database/prisma/prisma.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prismaService: PrismaService,
    private eventService: EventsService,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: createTicketDto.userId,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'User with the specified ID was not found',
        'User not found',
      );
    }

    const event = await this.prismaService.event.findUnique({
      where: {
        id: createTicketDto.eventId,
      },
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

    if (!event.ticketDefaultPrice) {
      throw new NotFoundException(
        'No default ticket price found for this event',
        'No default ticket price found',
      );
    }

    await this.prismaService.ticket.create({
      data: {
        ...createTicketDto,
        price: event.ticketDefaultPrice,
      },
    });

    await this.eventService.updateEventAvaliableTickets(
      createTicketDto.eventId,
    );

    return { message: 'Ticket created successfully.', status: 201 };
  }

  async findAll(page: number) {
    try {
      const pageSize = 25;
      const tickets = await this.prismaService.ticket.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { tickets };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const ticket = await this.prismaService.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundException(
          'Ticket with the specified ID was not found',
          'Ticket not found',
        );
      }

      return { ticket };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket with the specified ID was not found',
        'Ticket not found',
      );
    }

    await this.prismaService.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
      },
    });

    return { message: 'Ticket updates successfully.', status: 200 };
  }

  async remove(id: string) {
    const ticket = await this.prismaService.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(
        'Ticket with the specified ID was not found',
        'Ticket not found',
      );
    }

    await this.prismaService.ticket.delete({
      where: { id },
    });

    return { message: 'Ticket deleted successfully.', status: 204 };
  }

  async generateTicket(): Promise<string> {
    const a = await this.prismaService.ticket.findMany();
    return JSON.stringify(a);
  }
}
