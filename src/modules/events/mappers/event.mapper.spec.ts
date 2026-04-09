import { EventMapper, NearbyEventRaw } from './event.mapper';
import { Event } from '@events/entities/event.entity';

describe('EventMapper', () => {
 const baseDate = new Date('2026-05-10T10:00:00Z');

 describe('toResponse', () => {
  it('deve mapear uma entidade Event para EventResponseDto com localização', () => {
   const mockEntity = {
    id: 'event-123',
    organizerId: 'org-456',
    slug: 'meu-evento-top',
    title: 'Meu Evento Top',
    description: 'Descrição do evento',
    coverImageUrl: 'https://img.com/capa.jpg',
    eventDate: baseDate,
    createdAt: baseDate,
    location: {
     type: 'Point',
     coordinates: [-48.548, -27.595],
    },
   } as Event;

   const result = EventMapper.toResponse(mockEntity);

   expect(result).toEqual({
    id: 'event-123',
    organizerId: 'org-456',
    slug: 'meu-evento-top',
    title: 'Meu Evento Top',
    description: 'Descrição do evento',
    coverImageUrl: 'https://img.com/capa.jpg',
    eventDate: baseDate,
    createdAt: baseDate,
    location: {
     longitude: -48.548,
     latitude: -27.595,
    },
   });
  });

  it('deve mapear uma entidade Event para EventResponseDto sem localização (undefined)', () => {
   const mockEntityWithoutLocation = {
    id: 'event-123',
    title: 'Evento sem Local',
    location: null,
   } as unknown as Event;

   const result = EventMapper.toResponse(mockEntityWithoutLocation);

   expect(result.id).toBe('event-123');
   expect(result.location).toBeUndefined();
  });
 });

 describe('toResponseList', () => {
  it('deve mapear um array de entidades para um array de DTOs', () => {
   const mockEntities = [
    { id: '1', title: 'Evento 1', location: null },
    { id: '2', title: 'Evento 2', location: null },
   ] as any;

   const result = EventMapper.toResponseList(mockEntities);

   expect(result).toHaveLength(2);
   expect(result[0].id).toBe('1');
   expect(result[1].id).toBe('2');
  });

  it('deve retornar um array vazio se receber um array vazio', () => {
   expect(EventMapper.toResponseList([])).toEqual([]);
  });
 });

 describe('fromNearbyRaw', () => {
  it('deve mapear resultados crus do banco convertendo strings para números', () => {
   const rawResult: NearbyEventRaw = {
    id: 'event-123',
    organizerId: 'org-456',
    slug: 'evento-proximo',
    title: 'Evento Próximo',
    description: 'Perto de você',
    coverImageUrl: 'img.jpg',
    eventDate: baseDate,
    createdAt: baseDate,
    latitude: '-27.595',
    longitude: '-48.548',
    distance: '1500.55',
   };

   const result = EventMapper.fromNearbyRaw(rawResult);

   expect(result).toEqual({
    id: 'event-123',
    organizerId: 'org-456',
    slug: 'evento-proximo',
    title: 'Evento Próximo',
    description: 'Perto de você',
    coverImageUrl: 'img.jpg',
    eventDate: baseDate,
    createdAt: baseDate,
    location: {
     latitude: -27.595,
     longitude: -48.548,
     distance: 1500.55,
    },
   });

   expect(typeof result.location!.latitude).toBe('number');
   expect(typeof result.location!.longitude).toBe('number');
   expect(typeof result.location!.distance).toBe('number');
  });
 });
});