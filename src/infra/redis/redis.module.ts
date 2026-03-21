import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { SessionService } from './session.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
 imports: [ConfigModule],
 providers: [RedisProvider, SessionService],
 exports: [RedisProvider, SessionService],
})
export class RedisModule { }