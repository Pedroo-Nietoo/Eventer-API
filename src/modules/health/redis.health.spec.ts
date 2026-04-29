import { Test, TestingModule } from '@nestjs/testing';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

describe('RedisHealthIndicator', () => {
 let healthIndicator: RedisHealthIndicator;
 let redisClient: any;
 let healthIndicatorService: any;

 const mockIndicator = {
  up: jest.fn(),
  down: jest.fn(),
 };

 const mockHealthIndicatorService = {
  check: jest.fn().mockReturnValue(mockIndicator),
 };

 const mockRedisClient = {
  ping: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    RedisHealthIndicator,
    { provide: 'REDIS', useValue: mockRedisClient },
    { provide: HealthIndicatorService, useValue: mockHealthIndicatorService },
   ],
  }).compile();

  healthIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  redisClient = module.get('REDIS');
  healthIndicatorService = module.get(HealthIndicatorService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('should be defined', () => {
  expect(healthIndicator).toBeDefined();
 });

 describe('isHealthy', () => {
  it('deve retornar indicator.up() quando o ping no Redis for bem-sucedido', async () => {
   const key = 'redis';
   const expectedUpResult = { redis: { status: 'up' } };

   mockRedisClient.ping.mockResolvedValue('PONG');
   mockIndicator.up.mockReturnValue(expectedUpResult);

   const result = await healthIndicator.isHealthy(key);

   expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
   expect(redisClient.ping).toHaveBeenCalledTimes(1);
   expect(mockIndicator.up).toHaveBeenCalledTimes(1);
   expect(result).toEqual(expectedUpResult);
  });

  it('deve retornar indicator.down() com a mensagem de erro quando o ping falhar', async () => {
   const key = 'redis';
   const errorMessage = 'Connection timeout';
   const expectedDownResult = { redis: { status: 'down', message: errorMessage } };

   mockRedisClient.ping.mockRejectedValue(new Error(errorMessage));
   mockIndicator.down.mockReturnValue(expectedDownResult);

   const result = await healthIndicator.isHealthy(key);

   expect(healthIndicatorService.check).toHaveBeenCalledWith(key);
   expect(redisClient.ping).toHaveBeenCalledTimes(1);
   expect(mockIndicator.down).toHaveBeenCalledWith({ message: errorMessage });
   expect(result).toEqual(expectedDownResult);
  });

  it('deve retornar indicator.down() com "Unknown error" se o erro não for uma instância de Error', async () => {
   const key = 'redis';
   const expectedDownResult = { redis: { status: 'down', message: 'Unknown error' } };

   mockRedisClient.ping.mockRejectedValue('String error');
   mockIndicator.down.mockReturnValue(expectedDownResult);

   const result = await healthIndicator.isHealthy(key);

   expect(mockIndicator.down).toHaveBeenCalledWith({ message: 'Unknown error' });
   expect(result).toEqual(expectedDownResult);
  });
 });
});