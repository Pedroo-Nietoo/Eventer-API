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

      return await this.prismaService.event.create({
        data: {
          ...createEventDto,
          date: new Date(createEventDto.date),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(page?: number) {
    try {
      const pageSize = 25;
      const events = await this.prismaService.event.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page && page > 0 ? (page - 1) * pageSize : 0,
      });

      return { events };
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: string) {
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
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
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

    return { message: 'Event updated successfully', status: 204 };
  }

  async remove(id: string) {
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
  }
}
