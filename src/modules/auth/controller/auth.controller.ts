import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginUseCase } from '../use-cases/login.usecase';
import { LoginDto } from '../dto/login.dto';
import { SwaggerAuthController as Doc } from './auth.swagger';

@Doc.Main()
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) { }


  @Doc.Login()
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(req.user);
  }
}