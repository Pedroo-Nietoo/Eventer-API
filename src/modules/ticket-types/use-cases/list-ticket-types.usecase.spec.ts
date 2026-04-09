import { Test, TestingModule } from '@nestjs/testing';
import { ListTicketTypesUseCase } from './list-ticket-types.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';

describe('ListTicketTypesUseCase', () => {
 let useCase: ListTicketTypesUseCase;
 let ticketTypesRepository: TicketTypesRepository;

 const mockTicketTypesRepository = {
  findAllWithEvent: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListTicketTypesUseCase,
    {
     provide: TicketTypesRepository,
     useValue: mockTicketTypesRepository,
    },
   ],
  }).compile();

  useCase = module.get<ListTicketTypesUseCase>(ListTicketTypesUseCase);
  ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockEntities = [
   { id: '1', name: 'Lote 1', event: { id: 'evt-1' } },
   { id: '2', name: 'Lote 2', event: { id: 'evt-1' } },
  ];

  const mockResponseList = [
   { id: '1', name: 'Lote 1' },
   { id: '2', name: 'Lote 2' },
  ];

  it('deve retornar tipos de ingressos paginados com metadados corretos', async () => {

   const paginationDto: PaginationDto = { page: 2, limit: 10 };
   const totalItems = 25;


   mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([mockEntities, totalItems]);

   const mapperSpy = jest.spyOn(TicketTypeMapper, 'toResponseList').mockReturnValueOnce(mockResponseList as any);


   const result = await useCase.execute(paginationDto);



   expect(mockTicketTypesRepository.findAllWithEvent).toHaveBeenCalledWith(10, 10);
   expect(mapperSpy).toHaveBeenCalledWith(mockEntities);

   expect(result.data).toEqual(mockResponseList);
   expect(result.meta).toEqual({
    totalItems: 25,
    itemCount: 2,
    itemsPerPage: 10,
    totalPages: 3,
    currentPage: 2,
   });
  });

  it('deve usar valores padrão quando o DTO estiver vazio', async () => {

   mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([[], 0]);


   await useCase.execute({});



   expect(mockTicketTypesRepository.findAllWithEvent).toHaveBeenCalledWith(0, 20);
  });

  it('deve lidar com uma lista vazia de resultados', async () => {

   mockTicketTypesRepository.findAllWithEvent.mockResolvedValueOnce([[], 0]);


   const result = await useCase.execute({ page: 1, limit: 10 });


   expect(result.data).toEqual([]);
   expect(result.meta.totalItems).toBe(0);
   expect(result.meta.totalPages).toBe(0);
  });

  it('deve propagar erros do repositório', async () => {

   mockTicketTypesRepository.findAllWithEvent.mockRejectedValueOnce(new Error('Repository Error'));


   await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('Repository Error');
  });
 });
});