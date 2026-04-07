import { EventResponseDto } from "@events/dto/event-response.dto";
import { Event } from "@events/entities/event.entity";

export interface NearbyEventRaw {
 id: string;
 organizerId: string;
 slug: string;
 title: string;
 description: string;
 coverImageUrl: string;
 eventDate: Date;
 createdAt: Date;
 latitude: string | number;
 longitude: string | number;
 distance: string | number;
}

export class EventMapper {
 static toResponse(entity: Event): EventResponseDto {
  return {
   id: entity.id,
   organizerId: entity.organizerId,
   slug: entity.slug,
   title: entity.title,
   description: entity.description,
   coverImageUrl: entity.coverImageUrl,
   eventDate: entity.eventDate,
   location: entity.location
    ? {
     longitude: entity.location.coordinates[0],
     latitude: entity.location.coordinates[1],
    }
    : undefined,
   createdAt: entity.createdAt,
  };
 }

 static toResponseList(entities: Event[]): EventResponseDto[] {
  return entities.map((entity) => this.toResponse(entity));
 }

 static fromNearbyRaw(raw: NearbyEventRaw): EventResponseDto {
  return {
   id: raw.id,
   organizerId: raw.organizerId,
   slug: raw.slug,
   title: raw.title,
   description: raw.description,
   coverImageUrl: raw.coverImageUrl,
   eventDate: raw.eventDate,
   createdAt: raw.createdAt,
   location: {
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    distance: Number(raw.distance),
   },
  };
 }
}