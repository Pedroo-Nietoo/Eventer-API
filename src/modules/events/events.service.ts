import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import generateSlug from 'src/common/utils/generate-slug';
import { createId } from "@paralleldrive/cuid2";

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) { }

  async create(createEventDto: CreateEventDto) {
    let slug: string = generateSlug(createEventDto.title);
    slug = `${slug}-${createId()}`;

    const event = this.repository.create({
      ...createEventDto,
      slug,
      location: {
        type: 'Point',
        coordinates: [
          createEventDto.longitude, // longitude primeiro (verificar o motivo)
          createEventDto.latitude,
        ],
      },
    });

    return this.repository.save(event);
  }

  async findNearby(lat: number, lng: number, radius: number) {
    const raw = await this.repository
      .createQueryBuilder('event')
      .addSelect(
        `
      ST_Distance(
        event.location,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      )
      `,
        'distance',
      )
      .addSelect('ST_X(event.location::geometry)', 'longitude')
      .addSelect('ST_Y(event.location::geometry)', 'latitude')
      .where(
        `
      ST_DWithin(
        event.location,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )
      `,
        { lat, lng, radius },
      )
      .orderBy('distance', 'ASC')
      .getRawMany();

    return raw.map((event) => ({
      id: event.event_id,
      title: event.event_title,
      description: event.event_description,
      coverImageUrl: event.event_coverImageUrl,
      location: {
        distance: Number(event.distance),
        latitude: Number(event.latitude),
        longitude: Number(event.longitude),
      },
    }));
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const skip = (page - 1) * limit;

    const [events, total] = await this.repository.findAndCount({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImageUrl: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      skip: skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: events,
      meta: {
        totalItems: total,
        itemCount: events.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.repository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.repository.softDelete(id);
  }
}