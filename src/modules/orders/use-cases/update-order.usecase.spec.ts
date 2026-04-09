import { Test, TestingModule } from '@nestjs/testing';
import { UpdateOrderUseCase } from './update-order.usecase';
import { OrdersRepository } from '@orders/repository/orders.repository';
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

  const mockOrdersRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderUseCase,
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateOrderUseCase>(UpdateOrderUseCase);
    ordersRepository = module.get<OrdersRepository>(OrdersRepository);


    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const orderId = 'order-123';
    const mockOrder = {
      id: orderId,
      status: OrderStatus.PENDING,
      totalPrice: 100,
    } as any;

    it('deve atualizar o status do pedido com sucesso', async () => {

      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      mockOrdersRepository.save.mockImplementationOnce((val) => Promise.resolve(val));
      const mapperSpy = jest.spyOn(OrderMapper, 'toResponse');


      await useCase.execute(orderId, { status: OrderStatus.CANCELLED });


      expect(mockOrdersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CANCELLED })
      );
      expect(mapperSpy).toHaveBeenCalled();
    });

    it('deve retornar o pedido original se o DTO for vazio', async () => {

      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      const mapperSpy = jest.spyOn(OrderMapper, 'toResponse');


      await useCase.execute(orderId, {});


      expect(mockOrdersRepository.save).not.toHaveBeenCalled();
      expect(mapperSpy).toHaveBeenCalledWith(mockOrder);
    });

    it('deve lançar NotFoundException se o pedido não existir', async () => {

      mockOrdersRepository.findById.mockResolvedValueOnce(null);


      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(new NotFoundException(`Pedido com o ID ${orderId} não encontrado.`));
    });

    it('deve impedir a alteração de um pedido PAID para um status que não seja CANCELLED', async () => {

      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      mockOrdersRepository.findById.mockResolvedValueOnce(paidOrder);


      await expect(useCase.execute(orderId, { status: OrderStatus.PENDING }))
        .rejects.toThrow(new BadRequestException('Não é possível alterar um pedido já pago para este status.'));

      expect(mockOrdersRepository.save).not.toHaveBeenCalled();
    });

    it('deve permitir cancelar um pedido que já estava pago', async () => {

      const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
      mockOrdersRepository.findById.mockResolvedValueOnce(paidOrder);
      mockOrdersRepository.save.mockImplementationOnce((val) => Promise.resolve(val));


      await useCase.execute(orderId, { status: OrderStatus.CANCELLED });


      expect(mockOrdersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CANCELLED })
      );
    });

    it('deve lançar InternalServerErrorException e logar em caso de erro no banco', async () => {

      mockOrdersRepository.findById.mockResolvedValueOnce(mockOrder);
      const dbError = new Error('Database connection failed');
      mockOrdersRepository.save.mockRejectedValueOnce(dbError);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');


      await expect(useCase.execute(orderId, { status: OrderStatus.PAID }))
        .rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro ao atualizar pedido ID=${orderId}`),
        expect.any(String)
      );
    });
  });
});