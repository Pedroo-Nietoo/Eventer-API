import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@common/decorators/public.decorator';
import { SwaggerHealthController as Doc } from './health.swagger';
import { RedisHealthIndicator } from '../redis.health';
import { Throttle } from '@nestjs/throttler';

@Doc.Main()
@Throttle({ default: { limit: 20, ttl: 60000 } })
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) { }

  @Doc.CheckAll()
  @Get()
  @HealthCheck()
  checkAll() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1500 }),
      () => this.redis.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 250 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }
}
