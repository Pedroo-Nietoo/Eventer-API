import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TicketTypeModule } from './modules/ticket-types/ticket-type.module';
import { databaseConfig } from './infra/database/database.config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { OrdersModule } from './modules/orders/orders.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './infra/redis/redis.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { StorageModule } from './infra/aws/s3/storage.module';
import { WinstonModule } from 'nest-winston';
import { loggerConfigAsync } from './config/logger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    WinstonModule.forRootAsync(loggerConfigAsync),
    TypeOrmModule.forRootAsync(databaseConfig),
    UsersModule,
    AuthModule,
    EventsModule,
    TicketsModule,
    TicketTypeModule,
    OrdersModule,
    RedisModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }