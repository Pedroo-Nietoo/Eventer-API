import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsRepository } from './events.repository';
import { Event } from '@events/entities/event.entity';

describe('EventsRepository (Mocked)', () => {
 let repository: EventsRepository;
 let typeormRepo: Repository<Event>;

 const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
 };

 const mockTypeORMRepo = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    EventsRepository,
    {
     provide: getRepositoryToken(Event),
     useValue: mockTypeORMRepo,
    },
   ],
  }).compile();

  repository = module.get<EventsRepository>(EventsRepository);
  typeormRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('findBySlug', () => {
  it('deve chamar o findOne com o slug correto', async () => {
   const slug = 'show-do-pedro';
   await repository.findBySlug(slug);

   expect(typeormRepo.findOne).toHaveBeenCalledWith({
    where: { slug },
   });
  });
 });

 describe('findNearby (Query Logic)', () => {
  it('deve construir a query PostGIS corretamente', async () => {
   const lat = -27.59;
   const lng = -48.54;
   const radius = 5000;

   await repository.findNearby(lat, lng, radius);

   expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
    expect.stringContaining('ST_Distance'),
    'distance'
   );
   expect(mockQueryBuilder.where).toHaveBeenCalledWith(
    expect.stringContaining('ST_DWithin'),
    { lat, lng, radius }
   );
  });
 });
});