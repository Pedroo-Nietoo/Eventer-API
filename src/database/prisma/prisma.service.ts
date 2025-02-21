import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  //todo add config service
  constructor() {
    super({
      log: process.env.NODE_ENV === 'dev' ? ['query'] : [],
    });
  }

  async onModuleInit() {
    await (this as PrismaClient).$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
