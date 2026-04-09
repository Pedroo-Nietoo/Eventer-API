import { Test, TestingModule } from '@nestjs/testing';
import { FindTicketTypeUseCase } from './find-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { NotFoundException } from '@nestjs/common';

describe('FindTicketTypeUseCase', () => {
 let useCase: FindTicketTypeUseCase;
 let ticketTypesRepository: TicketTypesRepository;

 const mockTicketTypesRepository = {
  findById: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindTicketTypeUseCase,
    {
     provide: TicketTypesRepository,
     useValue: mockTicketTypesRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindTicketTypeUseCase>(FindTicketTypeUseCase);
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
  const mockId = 'ticket-uuid-123';
  const mockEntity = {
   id: mockId,
   name: 'Lote Estudante',
   price: 50,
   totalQuantity: 200,
   availableQuantity: 180,
  };

  const mockResponseDto = {
   id: mockId,
   name: 'Lote Estudante',
   price: 50,
  };

  it('deve retornar o ticket type mapeado quando encontrado', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce(mockEntity);
   const mapperSpy = jest.spyOn(TicketTypeMapper, 'toResponse').mockReturnValueOnce(mockResponseDto as any);


   const result = await useCase.execute(mockId);


   expect(mockTicketTypesRepository.findById).toHaveBeenCalledWith(mockId);
   expect(mapperSpy).toHaveBeenCalledWith(mockEntity);
   expect(result).toEqual(mockResponseDto);
  });

  it('deve lançar NotFoundException quando o lote não existir', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce(null);
   const mapperSpy = jest.spyOn(TicketTypeMapper, 'toResponse');


   await expect(useCase.execute(mockId)).rejects.toThrow(
    new NotFoundException('Tipo de ingresso não encontrado.')
   );

   expect(mapperSpy).not.toHaveBeenCalled();
  });

  it('deve propagar erros do repositório', async () => {

   const dbError = new Error('Database connection failed');
   mockTicketTypesRepository.findById.mockRejectedValueOnce(dbError);


   await expect(useCase.execute(mockId)).rejects.toThrow(dbError);
  });
 });
});