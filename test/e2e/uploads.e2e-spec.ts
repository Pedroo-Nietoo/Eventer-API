import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { StorageService } from '@infra/aws/s3/service/storage.service';
import { UserRole } from '@common/enums/role.enum';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    const mockStorageService = {
      generatePresignedUrl: jest.fn().mockResolvedValue({
        presignedUrl: 'https://meu-bucket-teste.s3.amazonaws.com/events/123-imagem.jpg?signature=mockada',
        finalUrl: 'https://cdn.meudominio.com/events/123-imagem.jpg',
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(StorageService)
      .useValue(mockStorageService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());

    await dataSource.query('TRUNCATE TABLE "users" CASCADE;');

    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const [user] = await dataSource.query(
      `INSERT INTO "users" (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Upload User', 'upload@nearby.com', hashedPassword, UserRole.USER]
    );

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'upload@nearby.com', password: 'Password123!' });

    accessToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /uploads/presigned-url', () => {
    it('Deve retornar 401 Unauthorized se o utilizador não enviar o token de acesso', async () => {
      await request(app.getHttpServer())
        .post('/uploads/presigned-url')
        .send({ fileName: 'foto.jpg', contentType: 'image/jpeg', folder: 'events' })
        .expect(401);
    });

    it('Deve retornar 400 Bad Request se os dados enviados (DTO) forem inválidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/presigned-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fileName: 'foto.jpg' })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });

    it('Deve gerar as URLs corretamente quando os dados forem válidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/uploads/presigned-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fileName: 'foto.jpg', contentType: 'image/jpeg', folder: 'events' })
        .expect(201);

      expect(response.body).toHaveProperty('presignedUrl');
      expect(response.body).toHaveProperty('finalUrl');
      expect(response.body.presignedUrl).toContain('meu-bucket-teste.s3.amazonaws.com');
      expect(response.body.finalUrl).toContain('cdn.meudominio.com');
    });
  });
});