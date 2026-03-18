import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repository/events.repository';
import { EventResponseDto } from '../dto/event-response.dto';

@Injectable()
export class FindNearbyEventsUseCase {
 constructor(private readonly eventsRepository: EventsRepository) { }

 async execute(lat: number, lng: number, radius: number, limit = 50): Promise<EventResponseDto[]> {
  const rawEvents = await this.eventsRepository.findNearby(lat, lng, radius, limit);

  return rawEvents.map((event) => ({
   id: event.event_id,
   organizerId: event.organizer_id,
   slug: event.event_slug,
   title: event.event_title,
   description: event.event_description,
   coverImageUrl: event.event_coverImageUrl,
   eventDate: event.event_eventDate,
   location: {
    distance: Number(event.distance),
    latitude: Number(event.latitude),
    longitude: Number(event.longitude),
   },
   createdAt: event.event_created_at,
  }));
 }
}