import { Event } from '../entities/event.entity';
import { EventResponseDto } from '../dto/event-response.dto';

export class EventMapper {
 static toResponse(entity: Event): EventResponseDto {
  return {
   id: entity.id,
   organizerId: entity.organizerId,
   slug: entity.slug,
   title: entity.title,
   description: entity.description,
   coverImageUrl: entity.coverImageUrl,
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
}