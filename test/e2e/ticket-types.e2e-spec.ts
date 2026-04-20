import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../../src/app.module';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { Event } from '@events/entities/event.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';

describe('TicketTypesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let eventId: string;
  let ticketTypeId: string;

  beforeAll(async () => {
    class MockStorageModule { }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(StorageModule)
      .useModule(MockStorageModule)
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
    await dataSource.query('TRUNCATE TABLE "ticket_types", "events", "users" CASCADE;');

    const userDto = {
      username: 'Organizador Lotes',
      email: 'lotes@eventer.com',
      password: 'Password123!',
    };

    const createRes = await request(app.getHttpServer()).post('/users').send(userDto);
    const userId = createRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userDto.email, password: userDto.password });
    accessToken = loginRes.body.access_token;

    const eventRepo = dataSource.getRepository(Event);
    const event = await eventRepo.save(
      eventRepo.create({
        title: 'Evento para Lotes',
        slug: 'evento-lotes-' + Date.now(),
        description: 'Descrição do evento',
        eventDate: new Date(Date.now() + 86400000),
        organizer: { id: userId },
        location: { type: 'Point', coordinates: [-46.6562, -23.5614] },
      }),
    );
    eventId = event.id;
  });

  describe('POST /ticket-types', () => {
    it('Deve criar um lote de ingressos com sucesso', async () => {
      const createDto = {
        name: 'Lote Promocional',
        price: 50.0,
        totalQuantity: 200,
        eventId: eventId,
      };

      const response = await request(app.getHttpServer())
        .post('/ticket-types')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Lote Promocional');
      expect(response.body.availableQuantity).toBe(200);
    });

    it('Deve retornar 404 se tentar criar num evento inexistente', async () => {
      const fakeEventId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer())
        .post('/ticket-types')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Lote Falho', price: 10, totalQuantity: 10, eventId: fakeEventId })
        .expect(404);

      expect(response.body.message).toBe('O evento informado não existe na base de dados.');
    });
  });

  describe('Consultas e Atualizações (GET, PATCH, DELETE)', () => {
    beforeEach(async () => {
      const ticketTypeRepo = dataSource.getRepository(TicketType);
      const ticketType = await ticketTypeRepo.save(
        ticketTypeRepo.create({
          name: 'Lote 1',
          price: 100.0,
          totalQuantity: 100,
          availableQuantity: 100,
          event: { id: eventId },
        }),
      );
      ticketTypeId = ticketType.id;
    });

    it('GET /ticket-types - Deve listar os lotes', async () => {
      const response = await request(app.getHttpServer())
        .get('/ticket-types')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.meta.totalItems).toBe(1);
    });

    it('GET /ticket-types/:id - Deve buscar um lote específico', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(ticketTypeId);
    });

    it('PATCH /ticket-types/:id - Deve atualizar a quantidade e recalcular a disponível', async () => {
      const updateDto = { totalQuantity: 150 };

      const response = await request(app.getHttpServer())
        .patch(`/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.totalQuantity).toBe(150);
      expect(response.body.availableQuantity).toBe(150);
    });

    it('DELETE /ticket-types/:id - Deve realizar o soft delete do lote se não houver vendas', async () => {
      await request(app.getHttpServer())
        .delete(`/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('DELETE /ticket-types/:id - Deve bloquear a exclusão se já existirem bilhetes vendidos', async () => {
      const ticketTypeRepo = dataSource.getRepository(TicketType);
      await ticketTypeRepo.update(ticketTypeId, { availableQuantity: 95 });

      const response = await request(app.getHttpServer())
        .delete(`/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.message).toContain('Não é possível excluir este lote pois já existem(m) 5 ingresso(s) vendido(s)');
    });
  });
});