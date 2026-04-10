import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTicketTypeUseCase } from './update-ticket-type.usecase';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UpdateTicketTypeUseCase', () => {
  let useCase: UpdateTicketTypeUseCase;
  let ticketTypesRepository: TicketTypesRepository;

  const mockTicketTypesRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTicketTypeUseCase,
        {
          provide: TicketTypesRepository,
          useValue: mockTicketTypesRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTicketTypeUseCase>(UpdateTicketTypeUseCase);
    ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const ticketTypeId = 'ticket-123';
    const mockTicketType = {
      id: ticketTypeId,
      name: 'Lote Regular',
      price: 100,
      totalQuantity: 100,
      availableQuantity: 80,
    } as any;

    it('deve aumentar o estoque corretamente', async () => {

      mockTicketTypesRepository.findById.mockResolvedValueOnce({ ...mockTicketType });
      mockTicketTypesRepository.save.mockImplementationOnce((val) => Promise.resolve(val));


      await useCase.execute(ticketTypeId, { totalQuantity: 150 });


      expect(mockTicketTypesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalQuantity: 150,
          availableQuantity: 130,
        })
      );
    });

    it('deve diminuir o estoque se o novo total for maior que os vendidos', async () => {

      mockTicketTypesRepository.findById.mockResolvedValueOnce({ ...mockTicketType });
      mockTicketTypesRepository.save.mockImplementationOnce((val) => Promise.resolve(val));


      await useCase.execute(ticketTypeId, { totalQuantity: 50 });


      expect(mockTicketTypesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          totalQuantity: 50,
          availableQuantity: 30,
        })
      );
    });

    it('deve lançar BadRequestException se o novo total for menor que os vendidos', async () => {

      mockTicketTypesRepository.findById.mockResolvedValueOnce({ ...mockTicketType });


      await expect(useCase.execute(ticketTypeId, { totalQuantity: 15 }))
        .rejects.toThrow(new BadRequestException(
          'A nova quantidade total não pode ser menor do que o número de ingressos já vendidos (20).'
        ));
    });

    it('deve atualizar apenas o nome e preço sem mexer no estoque', async () => {

      mockTicketTypesRepository.findById.mockResolvedValueOnce({ ...mockTicketType });
      mockTicketTypesRepository.save.mockImplementationOnce((val) => Promise.resolve(val));


      await useCase.execute(ticketTypeId, { name: 'Novo Nome', price: 120 });


      expect(mockTicketTypesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Novo Nome',
          price: 120,
          totalQuantity: 100,
          availableQuantity: 80,
        })
      );
    });

    it('deve lançar NotFoundException se o lote não existir', async () => {
      mockTicketTypesRepository.findById.mockResolvedValueOnce(null);

      await expect(useCase.execute(ticketTypeId, { name: 'Teste' }))
        .rejects.toThrow(NotFoundException);
    });
  });
});