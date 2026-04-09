import { Test, TestingModule } from '@nestjs/testing';
import { CreateTicketTypeUseCase } from './create-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { CreateTicketTypeDto } from '@ticket-types/dto/create-ticket-type.dto';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CreateTicketTypeUseCase', () => {
 let useCase: CreateTicketTypeUseCase;
 let ticketTypesRepository: TicketTypesRepository;

 const mockTicketTypesRepository = {
  create: jest.fn(),
  save: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateTicketTypeUseCase,
    {
     provide: TicketTypesRepository,
     useValue: mockTicketTypesRepository,
    },
   ],
  }).compile();

  useCase = module.get<CreateTicketTypeUseCase>(CreateTicketTypeUseCase);
  ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockDto: CreateTicketTypeDto = {
   name: 'Lote VIP',
   price: 250,
   totalQuantity: 100,
   eventId: 'event-uuid-123',
  };

  const mockEntity = {
   ...mockDto,
   id: 'ticket-type-1',
   availableQuantity: 100,
   event: { id: mockDto.eventId },
  };

  it('deve criar e salvar um novo tipo de ingresso com sucesso', async () => {

   mockTicketTypesRepository.create.mockReturnValue(mockEntity);
   mockTicketTypesRepository.save.mockResolvedValueOnce(mockEntity);

   const mapperSpy = jest.spyOn(TicketTypeMapper, 'toResponse').mockReturnValue({
    id: 'ticket-type-1',
    name: mockDto.name,
   } as any);


   const result = await useCase.execute(mockDto);


   expect(mockTicketTypesRepository.create).toHaveBeenCalledWith({
    ...mockDto,
    availableQuantity: mockDto.totalQuantity,
    event: { id: mockDto.eventId },
   });
   expect(mockTicketTypesRepository.save).toHaveBeenCalledWith(mockEntity);
   expect(mapperSpy).toHaveBeenCalledWith(mockEntity);
   expect(result).toHaveProperty('id', 'ticket-type-1');
  });

  it('deve lançar NotFoundException se o evento informado não existir (Erro 23503)', async () => {

   mockTicketTypesRepository.create.mockReturnValue(mockEntity);
   const fkError = { code: '23503' };
   mockTicketTypesRepository.save.mockRejectedValueOnce(fkError);


   await expect(useCase.execute(mockDto)).rejects.toThrow(
    new NotFoundException('O evento informado não existe na base de dados.')
   );
  });

  it('deve lançar InternalServerErrorException e logar em caso de erro genérico no banco', async () => {

   mockTicketTypesRepository.create.mockReturnValue(mockEntity);
   const dbError = new Error('Fatal database error');
   (dbError as any).stack = 'stack trace content';
   mockTicketTypesRepository.save.mockRejectedValueOnce(dbError);

   const loggerSpy = jest.spyOn(Logger.prototype, 'error');


   await expect(useCase.execute(mockDto)).rejects.toThrow(InternalServerErrorException);

   expect(loggerSpy).toHaveBeenCalledWith(
    expect.stringContaining('Erro ao criar tipo de ingresso: Fatal database error'),
    'stack trace content'
   );
  });
 });
});