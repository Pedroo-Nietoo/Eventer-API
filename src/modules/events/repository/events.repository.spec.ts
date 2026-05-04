import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsRepository } from './events.repository';
import { Event } from '@events/entities/event.entity';
import { EventMapper } from '@events/mappers/event.mapper';

jest.mock('@events/mappers/event.mapper', () => ({
 EventMapper: {
  fromNearbyRaw: jest.fn(),
 },
}));

describe('EventsRepository', () => {
 let repository: EventsRepository;
 let typeormRepo: Repository<Event>;

 const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  getRawMany: jest.fn(),
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
  it('deve chamar o findOne do TypeORM com o slug correto', async () => {
   const slug = 'show-do-pedro';
   const mockEvent = { id: '1', slug };
   mockTypeORMRepo.findOne.mockResolvedValueOnce(mockEvent);

   const result = await repository.findBySlug(slug);

   expect(typeormRepo.findOne).toHaveBeenCalledWith({
    where: { slug },
   });
   expect(result).toEqual(mockEvent);
  });
 });

 describe('findNearby (Query Logic)', () => {
  it('deve construir a query PostGIS corretamente e mapear os resultados', async () => {
   const lat = -27.59;
   const lng = -48.54;
   const radius = 5000;
   const customLimit = 20;

   const rawMockData = [{ id: 'evt-1', distance: 10 }];
   const mappedMockData = { id: 'evt-1', distance: 10, title: 'Mapeado' };

   mockQueryBuilder.getRawMany.mockResolvedValueOnce(rawMockData);
   (EventMapper.fromNearbyRaw as jest.Mock).mockReturnValueOnce(mappedMockData);

   const result = await repository.findNearby(lat, lng, radius, customLimit);

   expect(mockTypeORMRepo.createQueryBuilder).toHaveBeenCalledWith('event');
   expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
    expect.stringContaining('ST_Distance'),
    'distance',
   );
   expect(mockQueryBuilder.where).toHaveBeenCalledWith(
    expect.stringContaining('ST_DWithin'),
    { lat, lng, radius },
   );
   expect(mockQueryBuilder.limit).toHaveBeenCalledWith(customLimit);

   expect(EventMapper.fromNearbyRaw).toHaveBeenCalledWith(rawMockData[0]);
   expect(result).toEqual([mappedMockData]);
  });

  it('deve aplicar o limite padrão (50) se nenhum limite for fornecido', async () => {
   mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);

   await repository.findNearby(-23, -46, 1000);

   expect(mockQueryBuilder.limit).toHaveBeenCalledWith(50);
  });
 });
});