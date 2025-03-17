import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@database/prisma/prisma.module';
import { UsersModule } from '@modules/users/users.module';
import { EventsModule } from '@modules/events/events.module';
import { CategoriesModule } from '@modules/categories/categories.module';
import { AuthModule } from '@modules/auth/auth.module';
import { TicketsModule } from '@modules/tickets/tickets.module';
import { NotificationsGateway } from './modules/notifications/notifications.gateway';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QrCodeModule } from './common/qr-code/qr-code.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    EventsModule,
    CategoriesModule,
    TicketsModule,
    AuthModule,
    NotificationsModule,
    QrCodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
