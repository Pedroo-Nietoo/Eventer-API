/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

/**
 * Controller for authentication-related routes.
 */
@Controller('auth')
export class AuthController {
  /**
   * Creates an instance of AuthController.
   * @param authService - The authentication service.
   */
  constructor(private authService: AuthService) {}

  /**
   * Handles user sign-in.
   * @param signInDto - The sign-in data transfer object containing email and password.
   * @returns The authentication result.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  /**
   * Retrieves the profile of the authenticated user.
   * @param req - The request object containing user information.
   * @returns The user profile.
   */
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
