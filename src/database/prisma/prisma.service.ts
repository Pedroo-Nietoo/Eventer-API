import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      log: configService.get<string>('NODE_ENV') === 'dev' ? ['query'] : [],
    });
  }

  async onModuleInit() {
    await (this as PrismaClient).$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
