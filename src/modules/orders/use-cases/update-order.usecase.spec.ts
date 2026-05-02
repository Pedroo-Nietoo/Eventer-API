import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderUseCase } from './update-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { DataSource, EntityManager } from 'typeorm';
import { OrderMapper } from '@orders/mappers/order.mapper';
import { OrderStatus } from '@common/enums/order-status.enum';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';

describe('UpdateOrderUseCase', () => {
  let useCase: UpdateOrderUseCase;
  let ordersRepository: OrdersRepository;
  let ticketTypesRepository: TicketTypesRepository;

  const mockManager = {
    save: jest.fn(),
  } as unknown as EntityManager;

  const mockOrdersRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const mockTicketTypesRepository = {
    incrementStock: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation(async (cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderUseCase,
        { provide: OrdersRepository, useValue: mockOrdersRepository },
        { provide: TicketTypesRepository, useValue: mockTicketTypesRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    useCase = module.get<UpdateOrderUseCase>(UpdateOrderUseCase);
    ordersRepository = module.get<OrdersRepository>(OrdersRepository);
    ticketTypesRepository = module.get<TicketTypesRepository>(TicketTypesRepository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });

    jest.spyOn(OrderMapper, 'toResponse').mockImplementation((val) => val as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const orderId = 'order-123';
    const mockOrder = {
      id: orderId,
      status: OrderStatus.PENDING,
      totalPrice: 100,
      ticketTypeId: 'ticket-1',
      quantity: 2,
    } as any;

    it('deve lançar NotFoundException se o pedido não existir', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(null);

      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(new NotFoundException(`Pedido com o ID ${orderId} não encontrado.`));
    });

    it('deve retornar o pedido original se o DTO for vazio (!dto ou sem chaves)', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);

      const result = await useCase.execute(orderId, {} as any);

      expect(mockOrdersRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('deve salvar direto se DTO tiver campos, mas nenhum status (!newStatus)', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      mockOrdersRepository.save.mockResolvedValueOnce({ ...mockOrder, quantity: 5 });

      await useCase.execute(orderId, { quantity: 5 } as any);

      expect(mockOrdersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 5 })
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('deve salvar direto se o novo status for igual ao antigo (oldStatus === newStatus)', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      mockOrdersRepository.save.mockResolvedValueOnce(mockOrder);

      await useCase.execute(orderId, { status: OrderStatus.PENDING });

      expect(mockOrdersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.PENDING })
      );
      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('deve impedir a alteração de um pedido PAID para um status que não seja CANCELLED ou REFUNDED', async () => {
      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      mockOrdersRepository.findById.mockResolvedValueOnce(paidOrder);

      await expect(useCase.execute(orderId, { status: OrderStatus.PENDING }))
        .rejects.toThrow(new BadRequestException('Um pedido pago só pode ser alterado para CANCELLED ou REFUNDED.'));

      expect(mockOrdersRepository.save).not.toHaveBeenCalled();
    });

    it('deve usar transação e devolver estoque se for cancelado/expirado (needsToReturnStock = true)', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      const updatedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      (mockManager.save as jest.Mock).mockResolvedValueOnce(updatedOrder);

      await useCase.execute(orderId, { status: OrderStatus.CANCELLED });

      expect(mockDataSource.transaction).toHaveBeenCalled();

      expect(mockTicketTypesRepository.incrementStock).toHaveBeenCalledWith(
        mockOrder.ticketTypeId,
        mockOrder.quantity,
        mockManager
      );

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CANCELLED })
      );
      expect(mockOrdersRepository.save).not.toHaveBeenCalled();
    });

    it('deve atualizar o status sem transação se não precisar devolver estoque (needsToReturnStock = false)', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      const updatedOrder = { ...mockOrder, status: OrderStatus.PAID };
      mockOrdersRepository.save.mockResolvedValueOnce(updatedOrder);

      await useCase.execute(orderId, { status: OrderStatus.PAID });

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
      expect(mockOrdersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.PAID })
      );
    });

    it('deve repassar NotFoundException caso ela seja lançada de dentro do try', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      mockOrdersRepository.save.mockRejectedValueOnce(new NotFoundException('Teste'));

      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(NotFoundException);
    });

    it('deve lançar InternalServerErrorException e extrair .stack se o erro for instância de Error', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      const dbError = new Error('Database connection failed');
      mockOrdersRepository.save.mockRejectedValueOnce(dbError);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro ao atualizar pedido ID=${orderId}`),
        dbError.stack
      );
    });

    it('deve lançar InternalServerErrorException e logar mensagem genérica se o erro NÃO for instância de Error', async () => {
      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      mockOrdersRepository.save.mockRejectedValueOnce('Apenas uma string de erro');

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro ao atualizar pedido ID=${orderId}`),
        'Sem stack trace disponível'
      );
    });
  });
});