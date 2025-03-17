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

/**
 * Service responsible for handling ticket-related operations.
 */
@Injectable()
export class TicketsService {
  /**
   * Constructs a new instance of the TicketsService.
   * @param prismaService - The Prisma service for database operations.
   * @param eventService - The Events service for event-related operations.
   */
  constructor(
    private readonly prismaService: PrismaService,
    private eventService: EventsService,
  ) {}

  /**
   * Creates a new ticket.
   * @param createTicketDto - The data transfer object containing ticket creation details.
   * @returns A success message and status code.
   * @throws NotFoundException if the user or event is not found.
   * @throws ConflictException if no tickets are available for the event.
   */
  async create(createTicketDto: CreateTicketDto) {
    try {
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
    } catch(error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Retrieves all tickets with pagination.
   * @param page - The page number for pagination.
   * @returns An object containing the list of tickets.
   * @throws InternalServerErrorException if an error occurs during retrieval.
   */
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

  /**
   * Retrieves a single ticket by its ID.
   * @param id - The ID of the ticket to retrieve.
   * @returns An object containing the ticket details.
   * @throws NotFoundException if the ticket is not found.
   * @throws InternalServerErrorException if an error occurs during retrieval.
   */
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

  /**
   * Updates an existing ticket.
   * @param id - The ID of the ticket to update.
   * @param updateTicketDto - The data transfer object containing updated ticket details.
   * @returns A success message and status code.
   * @throws NotFoundException if the ticket is not found.
   */
  async update(id: string, updateTicketDto: UpdateTicketDto) {
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
  
      await this.prismaService.ticket.update({
        where: { id },
        data: {
          ...updateTicketDto,
        },
      });
  
      return { message: 'Ticket updates successfully.', status: 200 };
    } catch(error) {
      throw new InternalServerErrorException(error);
    }
  }
  
    /**
     * Deletes a ticket by its ID.
     * @param id - The ID of the ticket to delete.
     * @returns A success message and status code.
     * @throws NotFoundException if the ticket is not found.
     */
    async remove(id: string) {
      
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
    
        await this.prismaService.ticket.delete({
          where: { id },
        });
    
        return { message: 'Ticket deleted successfully.', status: 204 };
      } catch(error) {
        throw new InternalServerErrorException(error);
      }
    }
}
