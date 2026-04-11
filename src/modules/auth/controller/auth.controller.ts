import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest } from 'express';
import { SwaggerAuthController as Doc } from './auth.swagger';
import { Public } from '@common/decorators/public.decorator';
import { LoginUseCase } from '@auth/use-cases/login.usecase';
import { LogoutUseCase } from '@auth/use-cases/logout.usecase';
import { type AuthenticatedUser } from '@common/decorators/current-user.decorator';

@Doc.Main()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Doc.Login()
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(@Request() req: ExpressRequest) {
    return this.loginUseCase.execute(req.user as AuthenticatedUser);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: ExpressRequest) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || '';

    await this.logoutUseCase.execute(token);
  }
}
