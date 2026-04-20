import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { MailService } from '@services/mail/mail.service';
import { Event } from '@events/entities/event.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { AppModule } from './../../src/app.module';

describe('TicketsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let eventId: string;
  let ticketTypeId: string;

  beforeAll(async () => {
    class MockStorageModule { }

    const mockMailService = {
      sendTicketEmail: jest.fn().mockResolvedValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(StorageModule)
      .useModule(MockStorageModule)
      .overrideProvider(MailService)
      .useValue(mockMailService)
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
    await dataSource.query('TRUNCATE TABLE "tickets", "ticket_types", "events", "users" CASCADE;');

    const userDto = {
      username: 'Comprador E2E',
      email: 'comprador@nearby.com',
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
        title: 'Evento Teste',
        slug: 'evento-teste-' + Date.now(),
        description: 'Desc',
        eventDate: new Date(Date.now() - 86400000),
        organizer: { id: userId },
        location: {
          type: 'Point',
          coordinates: [-46.6562, -23.5614],
        },
      }),
    );
    eventId = event.id;

    const ticketTypeRepo = dataSource.getRepository(TicketType);
    const ticketType = await ticketTypeRepo.save(
      ticketTypeRepo.create({
        name: 'Lote 1',
        price: 100.0,
        totalQuantity: 50,
        availableQuantity: 50,
        event: { id: eventId },
      }),
    );
    ticketTypeId = ticketType.id;
  });

  describe('POST /tickets', () => {
    it('Deve criar um ingresso com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('VALID');
      expect(response.body.purchasePrice).toBe(100);
    });

    it('Deve retornar 400 se o evento e lote não baterem', async () => {
      const fakeEventId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId: fakeEventId, ticketTypeId })
        .expect(400);
    });
  });

  describe('GET /tickets', () => {
    it('Deve listar ingressos com paginação', async () => {
      await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId });

      const response = await request(app.getHttpServer())
        .get('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('Deve buscar um ingresso por ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId });

      const ticketId = createRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(ticketId);
    });
  });

  describe('POST /tickets/validate', () => {
    it('Deve validar um ingresso com sucesso', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId });

      const response = await request(app.getHttpServer())
        .post('/tickets/validate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ qrCode: createRes.body.qrCode })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /tickets/:id', () => {
    it('Deve atualizar o status para CANCELLED', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId });

      const ticketId = createRes.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'CANCELLED' })
        .expect(200);

      expect(response.body.status).toBe('CANCELLED');
    });
  });

  describe('DELETE /tickets/:id', () => {
    it('Deve remover um ingresso', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tickets')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ eventId, ticketTypeId });

      const ticketId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });
});