import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
 HealthCheckService,
 TypeOrmHealthIndicator,
 DiskHealthIndicator,
 MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

describe('HealthController', () => {
 let controller: HealthController;
 let healthCheckService: HealthCheckService;

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
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('should be defined', () => {
  expect(controller).toBeDefined();
 });

 describe('checkAll', () => {
  it('deve chamar HealthCheckService.check e retornar o status', async () => {
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

   mockHealthCheckService.check.mockResolvedValue(expectedResult);

   const result = await controller.checkAll();

   expect(healthCheckService.check).toHaveBeenCalled();
   expect(result).toEqual(expectedResult);
  });
 });
});