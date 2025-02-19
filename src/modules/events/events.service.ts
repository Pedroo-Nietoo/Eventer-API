import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import generateSlug from 'src/utils/generate-slug';

@Injectable()
export class EventsService {
  constructor(private readonly prismaService: PrismaService) {}

  //TODO validate ticketCount logic

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

      await this.prismaService.event.create({
        data: {
          ...createEventDto,
          date: new Date(createEventDto.date),
        },
      });

      return { message: 'Event created successfully', status: 201 };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(page: number) {
    try {
      const pageSize = 25;
      const events = await this.prismaService.event.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });

      return { events };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

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
      throw new InternalServerErrorException(error);
    }
  }

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
      throw new InternalServerErrorException(error);
    }
  }

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
      throw new InternalServerErrorException(error);
    }
  }
}
