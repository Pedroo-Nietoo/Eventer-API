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
import { OrderStatus } from '@common/enums/order-status.enum';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let ticketTypeId: string;

  beforeAll(async () => {
    const mockStripeService = {
      createCheckoutSession: jest.fn().mockImplementation(() => Promise.resolve({
        id: `sess_${Math.random().toString(36).substring(7)}`,
        url: 'https://checkout.stripe.com/c/pay/mocked_session',
      })),
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
      .useModule(class { })
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

    const event = await dataSource.getRepository(Event).save({
      title: 'Evento para Pedido',
      slug: 'evento-pedido-' + Date.now(),
      description: 'Desc',
      eventDate: new Date(Date.now() + 86400000),
      organizer: { id: userId },
      location: { type: 'Point', coordinates: [-46.6562, -23.5614] },
    });

    const ticketType = await dataSource.getRepository(TicketType).save({
      name: 'VIP',
      price: 350.0,
      totalQuantity: 100,
      availableQuantity: 100,
      event: { id: event.id },
    });
    ticketTypeId = ticketType.id;
  });

  describe('POST /orders', () => {
    it('Deve criar um pedido de compra e retornar a URL do Stripe', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 2 })
        .expect(201);

      expect(response.body).toHaveProperty('orderId');

      const tt = await dataSource.getRepository(TicketType).findOneBy({ id: ticketTypeId });
      expect(tt?.availableQuantity).toBe(98);
    });
  });

  describe('GET /orders', () => {
    it('Deve listar todos os pedidos paginados', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 1 });

      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBe(1);
    });

    it('Deve buscar um pedido específico pelo ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 1 });

      const id = createRes.body.orderId;

      const response = await request(app.getHttpServer())
        .get(`/orders/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(id);
      expect(response.body.status).toBe(OrderStatus.PENDING);
    });
  });

  describe('PATCH /orders', () => {
    it('Deve atualizar o status para CANCELLED e devolver o estoque', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 5 });

      const orderId = createRes.body.orderId;

      await request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: OrderStatus.CANCELLED })
        .expect(200);

      const tt = await dataSource.getRepository(TicketType).findOneBy({ id: ticketTypeId });
      expect(tt?.availableQuantity).toBe(100);
    });
  });

  describe('DELETE /orders', () => {
    it('Deve realizar a exclusão lógica do pedido', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ticketTypeId, quantity: 1 });

      const orderId = createRes.body.orderId;

      await request(app.getHttpServer())
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('POST /orders/webhook', () => {
    it('Deve encaminhar o pedido para a fila BullMQ após sucesso no Stripe', async () => {
      const queue = app.get<Queue>(getQueueToken('orders-queue'));
      const queueSpy = jest.spyOn(queue, 'add');

      const res = await request(app.getHttpServer())
        .post('/orders/webhook')
        .set('stripe-signature', 't=123,v1=mock')
        .send({ payload: 'mock' })
        .expect(201);

      expect(res.body).toEqual({ received: true });
      expect(queueSpy).toHaveBeenCalledWith(
        'complete-order-job',
        { orderId: '00000000-0000-0000-0000-000000000000' },
        expect.any(Object),
      );
    });
  });
});