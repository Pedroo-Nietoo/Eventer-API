import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrderExpirationCron } from './order-expiration.cron';
import { OrderExpirationService } from '@services/order-expiration.service';

describe('OrderExpirationCron', () => {
  let cron: OrderExpirationCron;
  let expirationService: OrderExpirationService;

  const mockOrderExpirationService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderExpirationCron,
        {
          provide: OrderExpirationService,
          useValue: mockOrderExpirationService,
        },
      ],
    }).compile();

    cron = module.get<OrderExpirationCron>(OrderExpirationCron);
    expirationService = module.get<OrderExpirationService>(
      OrderExpirationService,
    );

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('handleCron', () => {
    it('deve gerar log de início e chamar o OrderExpirationService.execute', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await cron.handleCron();

      expect(loggerSpy).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Iniciando rotina de verificação'));

      expect(expirationService.execute).toHaveBeenCalledTimes(1);
    });
  });
});