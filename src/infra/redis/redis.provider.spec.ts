import { ConfigService } from '@nestjs/config';
import { RedisProvider } from './redis.provider';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisProvider', () => {
 let mockConfigService: Partial<ConfigService>;

 beforeEach(() => {
  mockConfigService = {
   get: jest.fn(),
  };
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve definir corretamente os tokens e injeções do provider', () => {
  expect(RedisProvider.provide).toBe('REDIS');
  expect(RedisProvider.inject).toEqual([ConfigService]);
  expect(typeof RedisProvider.useFactory).toBe('function');
 });

 describe('useFactory', () => {
  it('deve instanciar o Redis usando a REDIS_URL do ConfigService', () => {
   const customRedisUrl = 'redis://meu-redis-remoto:6379';

   (mockConfigService.get as jest.Mock).mockReturnValue(customRedisUrl);

   const result = RedisProvider.useFactory(mockConfigService as ConfigService);

   expect(mockConfigService.get).toHaveBeenCalledWith('REDIS_URL');
   expect(Redis).toHaveBeenCalledWith(customRedisUrl);

   expect(result).toBeDefined();
  });

  it('deve instanciar o Redis usando a URL de fallback (localhost) quando não houver variável de ambiente', () => {
   (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

   RedisProvider.useFactory(mockConfigService as ConfigService);

   expect(mockConfigService.get).toHaveBeenCalledWith('REDIS_URL');
   expect(Redis).toHaveBeenCalledWith('redis://localhost:6379');
  });
 });
});