import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiCreatedResponse,
 ApiOkResponse,
 ApiNoContentResponse,
 ApiTags,
 ApiBearerAuth,
 ApiConflictResponse,
 ApiBadRequestResponse,
 ApiNotFoundResponse,
 ApiUnauthorizedResponse,
 ApiExtraModels,
 getSchemaPath,
 ApiForbiddenResponse,
 ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';

export const SwaggerUserController = {
 Main: () => applyDecorators(
  ApiTags('Users'),
  ApiBearerAuth(),
 ),

 Create: () => applyDecorators(
  ApiOperation({
   summary: 'Cria um novo usuário',
   description: 'Permite o registro de novos usuários. Por padrão, o papel (role) atribuído é USER.'
  }),
  ApiCreatedResponse({ description: 'Usuário criado com sucesso.', type: UserResponseDto }),
  ApiConflictResponse({ description: 'O e-mail informado já está em uso.' }),
  ApiBadRequestResponse({ description: 'Dados de entrada inválidos (validação do DTO).' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 FindAll: () => applyDecorators(
  ApiExtraModels(UserResponseDto),
  ApiOperation({
   summary: 'Lista usuários paginados',
   description: 'Retorna uma lista de usuários e metadados de paginação. Requer token JWT.'
  }),
  ApiOkResponse({
   description: 'Lista recuperada com sucesso.',
   schema: {
    properties: {
     data: { type: 'array', items: { $ref: getSchemaPath(UserResponseDto) } },
     meta: {
      type: 'object',
      properties: {
       totalItems: { type: 'number' },
       itemCount: { type: 'number' },
       itemsPerPage: { type: 'number' },
       totalPages: { type: 'number' },
       currentPage: { type: 'number' },
      }
     }
    }
   }
  }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 FindOne: () => applyDecorators(
  ApiOperation({ summary: 'Busca um usuário por ID específico' }),
  ApiOkResponse({ type: UserResponseDto }),
  ApiNotFoundResponse({ description: 'Usuário não encontrado no banco de dados.' }),
  ApiBadRequestResponse({ description: 'ID enviado não é um UUID válido.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 Update: () => applyDecorators(
  ApiOperation({
   summary: 'Atualiza dados do usuário',
   description: 'Permite atualizar username, email ou senha. O sistema faz o re-hash da senha se ela for enviada.'
  }),
  ApiOkResponse({ type: UserResponseDto }),
  ApiNotFoundResponse({ description: 'Usuário não encontrado.' }),
  ApiConflictResponse({ description: 'O novo e-mail já pertence a outro usuário.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 Delete: () => applyDecorators(
  ApiOperation({
   summary: 'Remove um usuário (Soft Delete)',
   description: 'Marca o usuário como removido no banco de dados sem deletar o registro fisicamente.'
  }),
  ApiNoContentResponse({ description: 'Usuário removido com sucesso.' }),
  ApiNotFoundResponse({ description: 'Usuário não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),
};