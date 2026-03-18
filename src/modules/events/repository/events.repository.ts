import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventsRepository extends BaseRepository<Event> {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
  ) {
    super(eventsRepo);
  }

  async findNearby(lat: number, lng: number, radius: number, limit = 50) {
    const point = `ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography`;

    return this.eventsRepo
      .createQueryBuilder('event')
      .select([
        'event.id',
        'event.organizer_id',
        'event.slug',
        'event.title',
        'event.description',
        'event.coverImageUrl',
        'event.createdAt'
      ])
      .addSelect(`ST_Distance(event.location, ${point})`, 'distance')
      .addSelect('ST_X(event.location::geometry)', 'longitude')
      .addSelect('ST_Y(event.location::geometry)', 'latitude')
      .where(`ST_DWithin(event.location, ${point}, :radius)`, { lat, lng, radius })
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawMany();
  }

  async findBySlug(slug: string): Promise<Event | null> {
    return this.eventsRepo.findOne({ where: { slug } });
  }
}