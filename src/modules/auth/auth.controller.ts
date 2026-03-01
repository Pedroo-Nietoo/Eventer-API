import { Controller, Post, UseGuards, Request, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Retorna 200 (OK) em vez de 201 (Created), que é o padrão do POST
  @UseGuards(AuthGuard('local')) // Intercepta e valida as credenciais
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // req.user foi injetado pela LocalStrategy após o sucesso
    return this.authService.login(req.user);
  }
}
