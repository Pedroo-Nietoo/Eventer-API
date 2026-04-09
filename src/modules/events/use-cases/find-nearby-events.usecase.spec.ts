import { Test, TestingModule } from '@nestjs/testing';
import { FindNearbyEventsUseCase } from './find-nearby-events.usecase';
import { EventsRepository } from '@events/repository/events.repository';

describe('FindNearbyEventsUseCase', () => {
 let useCase: FindNearbyEventsUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findNearby: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindNearbyEventsUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindNearbyEventsUseCase>(FindNearbyEventsUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockLat = -23.5505;
  const mockLng = -46.6333;
  const mockRadius = 10;

  const mockEventsResponse = [
   { id: 'evt-1', title: 'Show de Rock', distance: 2.5 },
   { id: 'evt-2', title: 'Feira Gastronômica', distance: 5.1 },
  ];

  it('deve buscar eventos próximos repassando as coordenadas e o limite PADRÃO (50)', async () => {
   mockEventsRepository.findNearby.mockResolvedValueOnce(mockEventsResponse);

   const result = await useCase.execute(mockLat, mockLng, mockRadius);

   expect(mockEventsRepository.findNearby).toHaveBeenCalledTimes(1);
   expect(mockEventsRepository.findNearby).toHaveBeenCalledWith(mockLat, mockLng, mockRadius, 50);
   expect(result).toEqual(mockEventsResponse);
  });

  it('deve buscar eventos próximos repassando as coordenadas e um limite CUSTOMIZADO', async () => {
   mockEventsRepository.findNearby.mockResolvedValueOnce(mockEventsResponse);
   const customLimit = 15;

   const result = await useCase.execute(mockLat, mockLng, mockRadius, customLimit);

   expect(mockEventsRepository.findNearby).toHaveBeenCalledTimes(1);
   expect(mockEventsRepository.findNearby).toHaveBeenCalledWith(mockLat, mockLng, mockRadius, customLimit);
   expect(result).toEqual(mockEventsResponse);
  });

  it('deve propagar a exceção se a busca geoespacial no banco falhar catastroficamente', async () => {
   const dbError = new Error('PostGIS spatial query failed');
   mockEventsRepository.findNearby.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(mockLat, mockLng, mockRadius)).rejects.toThrow(dbError);

   expect(mockEventsRepository.findNearby).toHaveBeenCalledTimes(1);
  });
 });
});