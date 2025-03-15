import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

/**
 * Initializes and starts the NestJS application.
 *
 * This function creates an instance of the NestJS application using the `AppModule`.
 * It retrieves the port number from the configuration service and starts the application
 * on the specified port. If the port number is not defined in the configuration, it defaults to 3000.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} A promise that resolves when the application has started.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
void bootstrap();
