import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTicketTypeUseCase } from './delete-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DeleteTicketTypeUseCase', () => {
 let useCase: DeleteTicketTypeUseCase;
 let ticketTypesRepository: TicketTypesRepository;

 const mockTicketTypesRepository = {
  findById: jest.fn(),
  softDelete: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteTicketTypeUseCase,
    {
     provide: TicketTypesRepository,
     useValue: mockTicketTypesRepository,
    },
   ],
  }).compile();

  useCase = module.get<DeleteTicketTypeUseCase>(DeleteTicketTypeUseCase);
  ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const ticketTypeId = 'ticket-123';

  it('deve excluir o lote com sucesso se não houver ingressos vendidos', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce({
    id: ticketTypeId,
    totalQuantity: 100,
    availableQuantity: 100,
   });
   mockTicketTypesRepository.softDelete.mockResolvedValueOnce({ affected: 1 });


   await expect(useCase.execute(ticketTypeId)).resolves.not.toThrow();
   expect(mockTicketTypesRepository.softDelete).toHaveBeenCalledWith(ticketTypeId);
  });

  it('deve lançar NotFoundException se o lote não existir', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce(null);


   await expect(useCase.execute(ticketTypeId)).rejects.toThrow(
    new NotFoundException('Tipo de ingresso não encontrado para exclusão.')
   );
   expect(mockTicketTypesRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se houver ingressos vendidos', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce({
    id: ticketTypeId,
    totalQuantity: 100,
    availableQuantity: 95,
   });


   await expect(useCase.execute(ticketTypeId)).rejects.toThrow(
    new BadRequestException(
     'Não é possível excluir este lote pois já existem(m) 5 ingresso(s) vendido(s). ' +
     'Para interromper as vendas, sugerimos editar a quantidade para zero.'
    )
   );
   expect(mockTicketTypesRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se o softDelete não afetar nenhuma linha', async () => {

   mockTicketTypesRepository.findById.mockResolvedValueOnce({
    id: ticketTypeId,
    totalQuantity: 10,
    availableQuantity: 10,
   });
   mockTicketTypesRepository.softDelete.mockResolvedValueOnce({ affected: 0 });


   await expect(useCase.execute(ticketTypeId)).rejects.toThrow(
    new NotFoundException('Erro ao tentar processar a exclusão do lote.')
   );
  });

  it('deve propagar erros do repositório', async () => {

   const dbError = new Error('Database connection failed');
   mockTicketTypesRepository.findById.mockRejectedValueOnce(dbError);


   await expect(useCase.execute(ticketTypeId)).rejects.toThrow(dbError);
  });
 });
});