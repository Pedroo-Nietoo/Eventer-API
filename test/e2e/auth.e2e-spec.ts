import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from './../../src/app.module';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@common/enums/role.enum';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    username: 'Usuário de Autenticação',
    email: 'autenticacao@eventer.com',
    password: 'Password123!',
  };

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

    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await dataSource.query(
      `INSERT INTO "users" (username, email, password, role) VALUES ($1, $2, $3, $4)`,
      [testUser.username, testUser.email, hashedPassword, UserRole.USER],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('Deve realizar login com sucesso e retornar o access_token (Opaque Token)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('Deve retornar 401 Unauthorized para senha incorreta', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'SenhaIncorreta123!' })
        .expect(401);

      expect(response.body.message).toBe('E-mail ou senha incorretos.');
    });

    it('Deve retornar 401 Unauthorized para e-mail não cadastrado', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'email_fantasma@eventer.com', password: testUser.password })
        .expect(401);

      expect(response.body.message).toBe('E-mail ou senha incorretos.');
    });
  });

  describe('POST /auth/logout', () => {
    let validToken: string;

    beforeEach(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      validToken = loginRes.body.access_token;
    });

    it('Deve realizar o logout com sucesso (204 No Content) e deletar do Redis', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);
    });

    it('Deve retornar 401 Unauthorized se tentar fazer logout sem enviar o token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });
});