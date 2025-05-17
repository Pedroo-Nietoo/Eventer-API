import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController is responsible for handling incoming HTTP requests and returning responses.
 */
@Controller('health')
export class AppController {
  /**
   * Constructs an instance of AppController.
   * @param appService - The service used to handle business logic.
   */
  constructor(private readonly appService: AppService) { }

  /**
   * Handles GET requests to the root endpoint and returns a greeting message.
   * @returns A greeting message string.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
