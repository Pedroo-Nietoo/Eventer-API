import { ConfigService } from '@nestjs/config';

/**
 * An instance of the ConfigService class.
 * This service is used to manage and access configuration settings.
 */
const configService = new ConfigService();

/**
 * Constants related to JWT (JSON Web Token) configuration.
 *
 * @constant
 * @type {Object}
 * @property {string} secret - The secret key used for signing JWT tokens, retrieved from the configuration service.
 */
export const jwtConstants = {
  secret: configService.get<string>('JWT_SECRET'),
};
