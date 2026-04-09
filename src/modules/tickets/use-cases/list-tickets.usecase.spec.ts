import { Test, TestingModule } from '@nestjs/testing';
import { ListTicketsUseCase } from './list-tickets.usecase';
import { TicketsRepository } from '@tickets/repository/ticket.repository';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';

describe('ListTicketsUseCase', () => {
 let useCase: ListTicketsUseCase;
 let ticketsRepository: TicketsRepository;

 const mockTicketsRepository = {
  findAllWithRelations: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListTicketsUseCase,
    {
     provide: TicketsRepository,
     useValue: mockTicketsRepository,
    },
   ],
  }).compile();

  useCase = module.get<ListTicketsUseCase>(ListTicketsUseCase);
  ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
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
   { id: 't-1', status: 'VALID' },
   { id: 't-2', status: 'VALID' },
  ];

  const mockResponseList = [
   { id: 't-1', status: 'VALID' },
   { id: 't-2', status: 'VALID' },
  ];

  it('deve retornar ingressos paginados com metadados corretos', async () => {

   const paginationDto: PaginationDto = { page: 1, limit: 10 };
   const totalInDb = 50;

   mockTicketsRepository.findAllWithRelations.mockResolvedValueOnce([mockEntities, totalInDb]);
   const mapperSpy = jest.spyOn(TicketMapper, 'toResponseList').mockReturnValueOnce(mockResponseList as any);


   const result = await useCase.execute(paginationDto);


   expect(ticketsRepository.findAllWithRelations).toHaveBeenCalledWith(0, 10);
   expect(mapperSpy).toHaveBeenCalledWith(mockEntities);

   expect(result.data).toEqual(mockResponseList);
   expect(result.meta).toEqual({
    totalItems: 50,
    itemCount: 2,
    itemsPerPage: 10,
    totalPages: 5,
    currentPage: 1,
   });
  });

  it('deve usar valores padrão quando o DTO de paginação for vazio', async () => {

   mockTicketsRepository.findAllWithRelations.mockResolvedValueOnce([[], 0]);


   await useCase.execute({});



   expect(ticketsRepository.findAllWithRelations).toHaveBeenCalledWith(0, 20);
  });

  it('deve calcular totalPages corretamente para divisões não exatas', async () => {

   const totalInDb = 25;
   mockTicketsRepository.findAllWithRelations.mockResolvedValueOnce([mockEntities, totalInDb]);


   const result = await useCase.execute({ page: 1, limit: 10 });


   expect(result.meta.totalPages).toBe(3);
  });

  it('deve propagar erros do repositório', async () => {

   const error = new Error('Database connection failed');
   mockTicketsRepository.findAllWithRelations.mockRejectedValueOnce(error);


   await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow(error);
  });
 });
});