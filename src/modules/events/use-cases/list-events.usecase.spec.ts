import { Test, TestingModule } from '@nestjs/testing';
import { ListEventsUseCase } from './list-events.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { EventMapper } from '@events/mappers/event.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';

describe('ListEventsUseCase', () => {
 let useCase: ListEventsUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findAll: jest.fn(),
  count: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListEventsUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<ListEventsUseCase>(ListEventsUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockEvents = [
   { id: '1', title: 'Evento 1' },
   { id: '2', title: 'Evento 2' },
  ];
  const mockResponseList = [
   { id: '1', title: 'Evento 1' },
   { id: '2', title: 'Evento 2' },
  ];

  it('deve retornar dados paginados corretamente na primeira página', async () => {

   const paginationDto: PaginationDto = { page: 1, limit: 10 };
   const totalItems = 25;

   mockEventsRepository.findAll.mockResolvedValueOnce(mockEvents);
   mockEventsRepository.count.mockResolvedValueOnce(totalItems);

   const mapperSpy = jest.spyOn(EventMapper, 'toResponseList').mockReturnValueOnce(mockResponseList as any);


   const result = await useCase.execute(paginationDto);



   expect(mockEventsRepository.findAll).toHaveBeenCalledWith(0, 10);
   expect(mockEventsRepository.count).toHaveBeenCalled();
   expect(mapperSpy).toHaveBeenCalledWith(mockEvents);

   expect(result.data).toEqual(mockResponseList);
   expect(result.meta).toEqual({
    totalItems: 25,
    itemCount: 2,
    itemsPerPage: 10,
    totalPages: 3,
    currentPage: 1,
   });
  });

  it('deve calcular o skip corretamente para páginas avançadas', async () => {

   const paginationDto: PaginationDto = { page: 3, limit: 20 };
   mockEventsRepository.findAll.mockResolvedValueOnce([]);
   mockEventsRepository.count.mockResolvedValueOnce(100);


   await useCase.execute(paginationDto);



   expect(mockEventsRepository.findAll).toHaveBeenCalledWith(40, 20);
  });

  it('deve usar valores padrão quando page e limit não são fornecidos', async () => {

   const paginationDto: PaginationDto = {};
   mockEventsRepository.findAll.mockResolvedValueOnce([]);
   mockEventsRepository.count.mockResolvedValueOnce(0);


   const result = await useCase.execute(paginationDto);


   expect(mockEventsRepository.findAll).toHaveBeenCalledWith(0, 20);
   expect(result.meta.itemsPerPage).toBe(20);
   expect(result.meta.currentPage).toBe(1);
  });

  it('deve retornar metadados zerados quando não houver eventos', async () => {

   mockEventsRepository.findAll.mockResolvedValueOnce([]);
   mockEventsRepository.count.mockResolvedValueOnce(0);


   const result = await useCase.execute({ page: 1, limit: 20 });


   expect(result.meta.totalItems).toBe(0);
   expect(result.meta.totalPages).toBe(0);
   expect(result.meta.itemCount).toBe(0);
  });

  it('deve propagar erro se o repositório falhar no count', async () => {

   mockEventsRepository.findAll.mockResolvedValueOnce([]);
   mockEventsRepository.count.mockRejectedValueOnce(new Error('Count failed'));


   await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('Count failed');
  });
 });
});