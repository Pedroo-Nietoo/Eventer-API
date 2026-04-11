import { EventResponseDto } from '@events/dto/event-response.dto';
import { EventsRepository } from '@events/repository/events.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindNearbyEventsUseCase {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async execute(
    lat: number,
    lng: number,
    radius: number,
    limit = 50,
  ): Promise<EventResponseDto[]> {
    return this.eventsRepository.findNearby(lat, lng, radius, limit);
  }
}
