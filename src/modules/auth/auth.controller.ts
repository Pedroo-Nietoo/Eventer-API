import {
  Controller,
  Post,
  Body,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '@decorators/public.decorator';

/**
 * Controller for handling authentication operations.
 *
 * @class
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Logs in a user and returns a JWT token.
   * @param body - The login credentials containing `email` and `password`.
   * @returns The JWT token if credentials are valid.
   * @throws UnauthorizedException if the credentials are invalid.
   */
  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body.email, body.password);
  }

  /**
   * Returns the profile of the currently logged-in user.
   * @param req - The request object containing the authenticated user.
   * @returns The profile of the currently logged-in user.
   * @throws UnauthorizedException if the request is not authenticated.
   */
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  /**
   * Generates a new access token using a refresh token.
   * @param body - The refresh token.
   * @returns The new access token.
   * @throws UnauthorizedException if the refresh token is invalid.
   */
  @Post('refresh-token')
  async refreshToken(@Body('token') token: string) {
    return this.authService.refreshToken(token);
  }
}