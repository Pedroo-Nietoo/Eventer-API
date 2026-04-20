import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../../src/app.module';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { UserRole } from '@common/enums/role.enum';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('EventsController (e2e)', () => {
 let app: INestApplication;
 let dataSource: DataSource;

 let creatorToken: string;
 let commonToken: string;
 let creatorId: string;

 let createdEventId: string;
 let createdEventSlug: string;

 beforeAll(async () => {
  class MockStorageModule { }

  const moduleFixture: TestingModule = await Test.createTestingModule({
   imports: [AppModule],
  })
   .overrideModule(StorageModule)
   .useModule(MockStorageModule)
   .overrideGuard(ThrottlerGuard)
   .useValue({ canActivate: () => true })
   .compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();

  dataSource = app.get<DataSource>(getDataSourceToken());

  await dataSource.query('TRUNCATE TABLE "events", "users" CASCADE;');

  const creatorDto = {
   username: 'Produtora E2E',
   email: 'produtora@nearby.com',
   password: 'Password123!',
  };
  const creatorRes = await request(app.getHttpServer()).post('/users').send(creatorDto);
  creatorId = creatorRes.body.id;

  await dataSource.query(`UPDATE "users" SET role = $1 WHERE id = $2`, [UserRole.EVENT_CREATOR, creatorId]);

  const loginCreatorRes = await request(app.getHttpServer())
   .post('/auth/login')
   .send({ email: creatorDto.email, password: creatorDto.password });
  creatorToken = loginCreatorRes.body.access_token;

  const commonDto = {
   username: 'Usuario Comum',
   email: 'comum@nearby.com',
   password: 'Password123!',
  };
  await request(app.getHttpServer()).post('/users').send(commonDto);

  const loginCommonRes = await request(app.getHttpServer())
   .post('/auth/login')
   .send({ email: commonDto.email, password: commonDto.password });
  commonToken = loginCommonRes.body.access_token;
 });

 afterAll(async () => {
  await app.close();
 });

 beforeEach(async () => {
  await dataSource.query('TRUNCATE TABLE "events" CASCADE;');
 });

 describe('POST /events', () => {
  it('Deve criar um evento com sucesso usando um usuário Organizador', async () => {
   const createEventDto = {
    title: 'Festival de Música E2E',
    description: 'Um grande festival de testes para passar na validação do DTO',
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    latitude: -23.5614,
    longitude: -46.6562,
    coverImageUrl: 'https://exemplo.com/imagem.jpg',
   };

   const response = await request(app.getHttpServer())
    .post('/events')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send(createEventDto)
    .expect(201);

   expect(response.body).toHaveProperty('id');
   expect(response.body).toHaveProperty('slug');
   expect(response.body.title).toBe(createEventDto.title);
   expect(response.body.organizerId).toBe(creatorId);
  });

  it('Deve retornar 403 Forbidden se um usuário comum tentar criar evento', async () => {
   const createEventDto = {
    title: 'Evento Clandestino',
    description: 'Descrição completa para garantir que o erro seja 403 e não 400',
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    latitude: -23.5,
    longitude: -46.6,
    coverImageUrl: 'https://exemplo.com/imagem.jpg',
   };

   const response = await request(app.getHttpServer())
    .post('/events')
    .set('Authorization', `Bearer ${commonToken}`)
    .send(createEventDto)
    .expect(403);

   expect(response.body.message).toBe('Forbidden resource');
  });
 });

 describe('Consultas de Eventos (GET)', () => {
  beforeEach(async () => {
   const createRes = await request(app.getHttpServer())
    .post('/events')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({
     title: 'Evento para Consulta',
     description: 'Descrição completa para garantir que o DTO aprove',
     eventDate: new Date(Date.now() + 86400000).toISOString(),
     latitude: -22.9068,
     longitude: -43.1729,
     coverImageUrl: 'https://exemplo.com/imagem.jpg',
    });

   expect(createRes.status).toBe(201);

   createdEventId = createRes.body.id;
   createdEventSlug = createRes.body.slug;
  });

  it('GET /events - Deve listar eventos com paginação', async () => {
   const response = await request(app.getHttpServer())
    .get('/events')
    .set('Authorization', `Bearer ${commonToken}`)
    .expect(200);

   expect(response.body.data.length).toBeGreaterThan(0);
   expect(response.body.meta.totalItems).toBe(1);
  });

  it('GET /events/:id - Deve buscar evento pelo ID', async () => {
   const response = await request(app.getHttpServer())
    .get(`/events/${createdEventId}`)
    .set('Authorization', `Bearer ${commonToken}`)
    .expect(200);

   expect(response.body.id).toBe(createdEventId);
  });

  it('GET /events/list/:slug - Deve buscar evento pelo Slug', async () => {
   const response = await request(app.getHttpServer())
    .get(`/events/list/${createdEventSlug}`)
    .set('Authorization', `Bearer ${commonToken}`)
    .expect(200);

   expect(response.body.slug).toBe(createdEventSlug);
  });

  it('GET /events/nearby - Deve encontrar eventos dentro do raio geográfico', async () => {
   const response = await request(app.getHttpServer())
    .get('/events/nearby?lat=-22.9068&lng=-43.1729&radius=10')
    .set('Authorization', `Bearer ${commonToken}`)
    .expect(200);

   expect(Array.isArray(response.body)).toBe(true);
   expect(response.body.length).toBeGreaterThan(0);
   expect(response.body[0].id).toBe(createdEventId);
  });

  it('GET /events/nearby - Não deve encontrar eventos fora do raio', async () => {
   const response = await request(app.getHttpServer())
    .get('/events/nearby?lat=-23.5614&lng=-46.6562&radius=10')
    .set('Authorization', `Bearer ${commonToken}`)
    .expect(200);

   expect(response.body.length).toBe(0);
  });
 });

 describe('Edição e Exclusão (PATCH, DELETE)', () => {
  beforeEach(async () => {
   const createRes = await request(app.getHttpServer())
    .post('/events')
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({
     title: 'Evento Temporário',
     description: 'Descrição completa para garantir que o DTO aprove',
     eventDate: new Date(Date.now() + 86400000).toISOString(),
     latitude: -23.5,
     longitude: -46.6,
     coverImageUrl: 'https://exemplo.com/imagem.jpg',
    });

   expect(createRes.status).toBe(201);

   createdEventId = createRes.body.id;
  });

  it('PATCH /events/:id - Organizador deve conseguir atualizar o título', async () => {
   const response = await request(app.getHttpServer())
    .patch(`/events/${createdEventId}`)
    .set('Authorization', `Bearer ${creatorToken}`)
    .send({ title: 'Título Editado' })
    .expect(200);

   expect(response.body.title).toBe('Título Editado');
  });

  it('PATCH /events/:id - Deve bloquear edição por Usuário Comum (403)', async () => {
   await request(app.getHttpServer())
    .patch(`/events/${createdEventId}`)
    .set('Authorization', `Bearer ${commonToken}`)
    .send({ title: 'Hackeado' })
    .expect(403);
  });

  it('DELETE /events/:id - Organizador deve conseguir excluir seu evento', async () => {
   await request(app.getHttpServer())
    .delete(`/events/${createdEventId}`)
    .set('Authorization', `Bearer ${creatorToken}`)
    .expect(204);

   await request(app.getHttpServer())
    .get(`/events/${createdEventId}`)
    .set('Authorization', `Bearer ${creatorToken}`)
    .expect(404);
  });
 });
});