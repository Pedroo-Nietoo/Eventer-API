import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Logger } from '@nestjs/common';

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'STRIPE_SECRET_KEY':
          return 'sk_test_123';
        case 'FRONTEND_URL':
          return 'https://meusite.com';
        case 'STRIPE_WEBHOOK_SECRET':
          return 'whsec_test_123';
        default:
          throw new Error(`Variável de ambiente ${key} não mockada`);
      }
    }),
  };

  const mockStripeClient = {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);

    (service as any).stripe = mockStripeClient;

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('deve criar uma sessão de checkout com sucesso convertendo o preço para centavos', async () => {
      const mockSessionResponse = { id: 'cs_test_123', url: 'https://checkout.stripe.com/...' };
      mockStripeClient.checkout.sessions.create.mockResolvedValueOnce(mockSessionResponse);

      const orderId = 'order_uuid_123';
      const ticketName = 'VIP';
      const unitPrice = 150.55;
      const quantity = 2;

      const result = await service.createCheckoutSession(
        orderId,
        ticketName,
        unitPrice,
        quantity,
      );

      expect(result).toEqual(mockSessionResponse);

      expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: `Ingresso - ${ticketName}`,
              },
              unit_amount: 15055,
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: `https://meusite.com/events/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://meusite.com/events/canceled`,
        metadata: {
          orderId: orderId,
        },
      });

      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('FRONTEND_URL');
    });

    it('deve lançar InternalServerErrorException se o Stripe falhar e registrar o erro', async () => {
      const mockError = new Error('Stripe API Timeout');
      mockStripeClient.checkout.sessions.create.mockRejectedValueOnce(mockError);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        service.createCheckoutSession('order_1', 'Normal', 50, 1),
      ).rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Erro ao criar sessão no Stripe',
        mockError,
      );
    });
  });

  describe('constructEvent', () => {
    it('deve construir o evento webhook utilizando a chave correta', () => {
      const mockEvent = { type: 'checkout.session.completed', id: 'evt_123' };
      mockStripeClient.webhooks.constructEvent.mockReturnValueOnce(mockEvent);

      const payload = Buffer.from('payload_data');
      const signature = 'test_signature';

      const result = service.constructEvent(payload, signature);

      expect(result).toEqual(mockEvent);
      expect(mockStripeClient.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_test_123',
      );
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith('STRIPE_WEBHOOK_SECRET');
    });
  });

  it('deve lançar erro se a assinatura do webhook for inválida (falha na verificação)', () => {
    const signatureError = new Error('No signatures found matching the expected signature for payload');
    mockStripeClient.webhooks.constructEvent.mockImplementationOnce(() => {
      throw signatureError;
    });

    const payload = Buffer.from('fake_payload');
    const signature = 'invalid_signature';

    expect(() => service.constructEvent(payload, signature)).toThrow(signatureError);

    expect(mockStripeClient.webhooks.constructEvent).toHaveBeenCalledWith(
      payload,
      signature,
      'whsec_test_123',
    );
  });
});