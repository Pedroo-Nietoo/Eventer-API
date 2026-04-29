import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
 HealthCheckService,
 TypeOrmHealthIndicator,
 DiskHealthIndicator,
 MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '../redis.health';

describe('HealthController', () => {
 let controller: HealthController;
 let healthCheckService: HealthCheckService;
 let typeOrmIndicator: TypeOrmHealthIndicator;
 let diskIndicator: DiskHealthIndicator;
 let memoryIndicator: MemoryHealthIndicator;
 let redisIndicator: RedisHealthIndicator;

 const mockHealthCheckService = {
  check: jest.fn(),
 };

 const mockTypeOrmIndicator = { pingCheck: jest.fn() };
 const mockDiskIndicator = { checkStorage: jest.fn() };
 const mockMemoryIndicator = { checkHeap: jest.fn() };
 const mockRedisIndicator = { isHealthy: jest.fn() };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   controllers: [HealthController],
   providers: [
    { provide: HealthCheckService, useValue: mockHealthCheckService },
    { provide: TypeOrmHealthIndicator, useValue: mockTypeOrmIndicator },
    { provide: DiskHealthIndicator, useValue: mockDiskIndicator },
    { provide: MemoryHealthIndicator, useValue: mockMemoryIndicator },
    { provide: RedisHealthIndicator, useValue: mockRedisIndicator },
   ],
  }).compile();

  controller = module.get<HealthController>(HealthController);
  healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  typeOrmIndicator = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  diskIndicator = module.get<DiskHealthIndicator>(DiskHealthIndicator);
  memoryIndicator = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
  redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('should be defined', () => {
  expect(controller).toBeDefined();
 });

 describe('checkAll', () => {
  it('deve chamar os indicadores de saúde corretamente dentro do HealthCheckService.check', async () => {
   const expectedResult: any = {
    status: 'ok',
    info: {
     database: { status: 'up' },
     redis: { status: 'up' },
    },
    error: {},
    details: {
     database: { status: 'up' },
     redis: { status: 'up' },
    },
   };

   mockHealthCheckService.check.mockImplementation(async (indicators: any[]) => {
    for (const indicator of indicators) {
     await indicator();
    }
    return expectedResult;
   });

   const result = await controller.checkAll();

   expect(healthCheckService.check).toHaveBeenCalled();

   expect(typeOrmIndicator.pingCheck).toHaveBeenCalledWith('database', { timeout: 1500 });
   expect(redisIndicator.isHealthy).toHaveBeenCalledWith('redis');
   expect(memoryIndicator.checkHeap).toHaveBeenCalledWith('memory_heap', 250 * 1024 * 1024);
   expect(diskIndicator.checkStorage).toHaveBeenCalledWith('disk', {
    path: '/',
    thresholdPercent: 0.9,
   });

   expect(result).toEqual(expectedResult);
  });
 });
});