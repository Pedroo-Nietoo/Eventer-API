import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../../src/app.module';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { StripeService } from '@infra/stripe/stripe.service';
import { Event } from '@events/entities/event.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { OrdersProcessor } from '@orders/queue/order.processor';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let ticketTypeId: string;
  let createdOrderId: string;

  beforeAll(async () => {
    class MockStorageModule { }

    const mockStripeService = {
      createCheckoutSession: jest.fn().mockResolvedValue({
        id: 'cs_test_mocked_session_id',
        url: 'https://checkout.stripe.com/c/pay/cs_test_mocked_session_id',
      }),
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { orderId: '00000000-0000-0000-0000-000000000000' },
          },
        },
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(StorageModule)
      .useModule(MockStorageModule)
      .overrideProvider(StripeService)
      .useValue(mockStripeService)
      .overrideProvider(OrdersProcessor)
      .useValue({ process: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "orders", "tickets", "ticket_types", "events", "users" CASCADE;');

    const userDto = {
      username: 'Comprador Pedido',
      email: 'pedido@eventer.com',
      password: 'Password123!',
    };

    const createRes = await request(app.getHttpServer()).post('/users').send(userDto);
    userId = createRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userDto.email, password: userDto.password });
    accessToken = loginRes.body.access_token;

    const eventRepo = dataSource.getRepository(Event);
    const event = await eventRepo.save(
      eventRepo.create({
        title: 'Evento para Pedido',
        slug: 'evento-pedido-' + Date.now(),
        description: 'Desc',
        eventDate: new Date(Date.now() + 86400000),
        organizer: { id: userId },
        location: { type: 'Point', coordinates: [-46.6562, -23.5614] },
      }),
    );

    const ticketTypeRepo = dataSource.getRepository(TicketType);
    const ticketType = await ticketTypeRepo.save(
      ticketTypeRepo.create({
        name: 'VIP',
        price: 350.0,
        totalQuantity: 100,
        availableQuantity: 100,
        event: { id: event.id },
      }),
    );
    ticketTypeId = ticketType.id;
  });

  describe('POST /orders', () => {
    it('Deve criar um pedido de compra e retornar a URL do Stripe', async () => {
      const createOrderDto = {
        ticketTypeId: ticketTypeId,
        quantity: 2,
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('orderId');
      expect(response.body.checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_mocked_session_id');

      createdOrderId = response.body.orderId;

      const ticketTypeRepo = dataSource.getRepository(TicketType);
      const updatedTicketType = await ticketTypeRepo.findOne({
        where: { id: ticketTypeId },
      });

      expect(updatedTicketType?.availableQuantity).toBe(98);
    });
  });

  describe('Consultas (GET, PATCH, DELETE)', () => {
    beforeEach(async () => {
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 1 });

      createdOrderId = createRes.body.orderId;
    });

    it('GET /orders - Deve listar os pedidos', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBe(1);
    });

    it('GET /orders/:id - Deve buscar um pedido específico', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdOrderId);
      expect(response.body.status).toBe('PENDING');
    });

    it('PATCH /orders/:id - Deve atualizar o status do pedido', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'CANCELLED' })
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
    });

    it('DELETE /orders/:id - Deve remover (soft delete) o pedido', async () => {
      await request(app.getHttpServer())
        .delete(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('POST /orders/webhook', () => {
    it('Deve processar o webhook do Stripe e adicionar na fila', async () => {
      const queue = app.get<Queue>(getQueueToken('orders-queue'));
      jest.spyOn(queue, 'add');

      const payload = { test: 'payload' };

      const response = await request(app.getHttpServer())
        .post('/orders/webhook')
        .set('stripe-signature', 't=123,v1=mock_signature')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({ received: true });

      expect(queue.add).toHaveBeenCalledWith(
        'complete-order-job',
        { orderId: '00000000-0000-0000-0000-000000000000' },
        expect.any(Object)
      );
    });
  });
});