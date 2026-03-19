import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { EventResponseDto } from '../dto/event-response.dto';

@Injectable()
export class FindNearbyEventsUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(lat: number, lng: number, radius: number, limit = 50): Promise<EventResponseDto[]> {
  return this.eventsRepository.findNearby(lat, lng, radius, limit);
 }
}