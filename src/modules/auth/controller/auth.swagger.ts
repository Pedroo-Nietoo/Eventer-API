import { LoginResponseDto } from '@auth/dto/login-response.dto';
import { LoginDto } from '@auth/dto/login.dto';
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export const SwaggerAuthController = {
  Main: () => applyDecorators(ApiTags('Auth')),

  Login: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Realiza o login do usuário',
        description: 'Gera um token após validar e-mail e senha.',
      }),
      ApiBody({ type: LoginDto }),
      ApiOkResponse({
        description: 'Login realizado com sucesso.',
        type: LoginResponseDto,
      }),
      ApiUnauthorizedResponse({
        description: 'E-mail ou senha incorretos.',
      }),
    ),

  Logout: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Encerra a sessão atual',
        description:
          'Recebe o token do usuário via cabeçalho Authorization e o remove da lista de sessões ativas, invalidando-o para requisições futuras.',
      }),
      ApiNoContentResponse({
        description: 'Logout efetuado com sucesso (token invalidado/removido).',
      }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Token ausente ou inválido.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor ao tentar remover a sessão.',
      }),
    ),
};
