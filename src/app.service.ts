import { Injectable } from '@nestjs/common';

/**
 * Service that provides application-wide functionalities.
 */
@Injectable()
export class AppService {
  /**
   * Returns a greeting message.
   * @returns A string containing 'Hello World!'
   */
  getHello(): string {
    return 'Hello World!';
  }
}
