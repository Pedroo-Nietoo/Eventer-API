import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { SessionService } from './services/session.service';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisProvider, SessionService, CacheService],
  exports: [RedisProvider, SessionService, CacheService],
})
export class RedisModule {}
