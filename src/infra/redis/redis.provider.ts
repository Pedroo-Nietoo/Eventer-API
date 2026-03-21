import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider = {
 provide: 'REDIS',
 inject: [ConfigService],
 useFactory: (configService: ConfigService) => {
  const redisUrl =
   configService.get<string>('REDIS_URL') ||
   'redis://localhost:6379';

  return new Redis(redisUrl);
 },
};