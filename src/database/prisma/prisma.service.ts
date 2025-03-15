import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/**
 * Service that extends PrismaClient to integrate with NestJS lifecycle hooks.
 * It connects to the database on module initialization and disconnects on module destruction.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  /**
   * Constructs a new PrismaService instance.
   * @param configService - The configuration service to retrieve environment variables.
   */
  constructor(private configService: ConfigService) {
    super({
      log: configService.get<string>('NODE_ENV') === 'dev' ? ['query'] : [],
    });
  }

  /**
   * Lifecycle hook that is called when the module has been initialized.
   * Connects to the Prisma database.
   */
  async onModuleInit() {
    await (this as PrismaClient).$connect();
  }

  /**
   * Lifecycle hook that is called when the module is about to be destroyed.
   * Disconnects from the Prisma database.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
