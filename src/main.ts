import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from '@config/swagger.config';
import { setupSecurity } from '@config/security.config';
import { setupGlobals } from '@config/globals.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  setupSecurity(app, configService);

  setupGlobals(app);

  setupSwagger(app);

  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();