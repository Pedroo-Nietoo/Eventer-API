import { LoginResponseDto } from '@auth/dto/login-response.dto';
import { LoginDto } from '@auth/dto/login.dto';
import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiOkResponse,
 ApiUnauthorizedResponse,
 ApiTags,
 ApiBody
} from '@nestjs/swagger';

export const SwaggerAuthController = {
 Main: () => applyDecorators(
  ApiTags('Auth'),
 ),

 Login: () => applyDecorators(
  ApiOperation({
   summary: 'Realiza o login do usuário',
   description: 'Gera um token JWT após validar e-mail e senha.'
  }),
  ApiBody({ type: LoginDto }),
  ApiOkResponse({
   description: 'Login realizado com sucesso.',
   type: LoginResponseDto
  }),
  ApiUnauthorizedResponse({
   description: 'E-mail ou senha incorretos.'
  }),
 ),
};