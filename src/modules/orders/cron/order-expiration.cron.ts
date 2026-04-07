import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderExpirationService } from '@services/order-expiration.service';

@Injectable()
export class OrderExpirationCron {
 private readonly logger = new Logger(OrderExpirationCron.name);

 constructor(private readonly expirationService: OrderExpirationService) { }

 @Cron(CronExpression.EVERY_5_MINUTES)
 async handleCron() {
  this.logger.log(`Iniciando rotina de verificação de pedidos expirados às ${new Date().toLocaleTimeString()}...`);
  await this.expirationService.execute();
 }
}