import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { AppModule } from './../../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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
    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');
  });

  describe('Rotas Públicas', () => {
    describe('POST /users', () => {
      it('Deve criar um usuário com sucesso', async () => {
        const createUserDto = {
          username: 'User E2E',
          email: 'testee2e@eventer.com',
          password: 'Password123!',
        };

        const response = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(createUserDto.email);
        expect(response.body.username).toBe(createUserDto.username);
        expect(response.body).not.toHaveProperty('password');
      });

      it('Não deve permitir a criação de usuário com e-mail duplicado', async () => {
        const createUserDto = {
          username: 'User Duplicado',
          email: 'duplicado@eventer.com',
          password: 'Password123!',
        };

        await request(app.getHttpServer()).post('/users').send(createUserDto);

        const response = await request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(409);

        expect(response.body.message).toBe('Este e-mail já está em uso.');
      });
    });
  });

  describe('Rotas Protegidas', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const userDto = {
        username: 'Auth User',
        email: 'auth@eventer.com',
        password: 'Password123!',
      };

      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send(userDto);
      userId = createRes.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: userDto.email, password: userDto.password });

      accessToken = loginRes.body.access_token;
    });

    describe('Bloqueio de Segurança', () => {
      it('Deve bloquear o acesso se não enviar o token (401 Unauthorized)', async () => {
        await request(app.getHttpServer())
          .get('/users')
          .expect(401);
      });
    });

    describe('GET /users', () => {
      it('Deve listar os usuários com paginação', async () => {
        const response = await request(app.getHttpServer())
          .get('/users?page=1&limit=10')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body).toHaveProperty('meta');
      });
    });

    describe('GET /users/:id', () => {
      it('Deve buscar os detalhes de um usuário pelo ID', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body.id).toBe(userId);
        expect(response.body.email).toBe('auth@eventer.com');
      });

      it('Deve retornar 404 caso o usuário não exista', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';

        await request(app.getHttpServer())
          .get(`/users/${fakeId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });

    describe('PATCH /users/:id', () => {
      it('Deve atualizar os dados do usuário', async () => {
        const updateDto = { username: 'Nome Atualizado E2E' };

        const response = await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.username).toBe(updateDto.username);

        const getResponse = await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(getResponse.body.username).toBe(updateDto.username);
      });
    });

    describe('DELETE /users/:id', () => {
      it('Deve deletar o usuário com sucesso (Soft Delete / 204 No Content)', async () => {
        await request(app.getHttpServer())
          .delete(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204);

        await request(app.getHttpServer())
          .get(`/users/${userId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });
});