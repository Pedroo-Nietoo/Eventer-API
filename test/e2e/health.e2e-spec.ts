import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../../src/app.module';
import { StorageModule } from '@infra/aws/s3/storage.module';
import { MemoryHealthIndicator } from '@nestjs/terminus';

describe('HealthController (e2e)', () => {
 let app: INestApplication;

 beforeAll(async () => {
  class MockStorageModule { }

  const moduleFixture: TestingModule = await Test.createTestingModule({
   imports: [AppModule],
  })
   .overrideModule(StorageModule)
   .useModule(MockStorageModule)
   .overrideProvider(MemoryHealthIndicator)
   .useValue({
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
   })
   .compile();

  app = moduleFixture.createNestApplication();
  await app.init();
 });

 afterAll(async () => {
  await app.close();
 });

 describe('GET /health', () => {
  it('Deve retornar status 200 (OK) e confirmar que toda a infraestrutura está saudável', async () => {
   const response = await request(app.getHttpServer())
    .get('/health')
    .expect(200);

   expect(response.body).toHaveProperty('status', 'ok');
   expect(response.body).toHaveProperty('info');

   expect(response.body.info).toHaveProperty('database');
   expect(response.body.info.database.status).toBe('up');

   expect(response.body.info).toHaveProperty('redis');
   expect(response.body.info.redis.status).toBe('up');

   expect(response.body.info).toHaveProperty('memory_heap');
   expect(response.body.info.memory_heap.status).toBe('up');

   expect(response.body.info).toHaveProperty('disk');
   expect(response.body.info.disk.status).toBe('up');
  });
 });
});