import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginUseCase } from '../use-cases/login.usecase';
import { LoginDto } from '../dto/login.dto';
import { SwaggerAuthController as Doc } from './auth.swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LogoutUseCase } from '../use-cases/logout.usecase';
import { Public } from 'src/common/decorators/public.decorator';

@Doc.Main()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase
  ) { }


  @Doc.Login()
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    await this.logoutUseCase.execute(token);
  }
}