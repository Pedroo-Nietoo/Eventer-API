import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiCreatedResponse,
 ApiOkResponse,
 ApiTags,
 ApiBearerAuth,
 ApiBadRequestResponse,
 ApiNotFoundResponse,
 ApiUnauthorizedResponse,
 ApiForbiddenResponse,
 ApiInternalServerErrorResponse,
 ApiExtraModels,
 getSchemaPath,
} from '@nestjs/swagger';
import { TicketTypeResponseDto } from '../dto/ticket-type-response.dto';

export const SwaggerTicketTypeController = {
 Main: () => applyDecorators(
  ApiTags('Ticket Types'),
  ApiBearerAuth(),
 ),

 Create: () => applyDecorators(
  ApiOperation({
   summary: 'Cria um novo tipo de ingresso (lote)',
   description: 'Define nome, preço e quantidade total para um evento específico.'
  }),
  ApiCreatedResponse({ description: 'Lote criado com sucesso.', type: TicketTypeResponseDto }),
  ApiNotFoundResponse({ description: 'O evento informado não existe.' }),
  ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' }),
 ),

 FindAll: () => applyDecorators(
  ApiExtraModels(TicketTypeResponseDto),
  ApiOperation({ summary: 'Lista lotes de ingressos paginados' }),
  ApiOkResponse({
   description: 'Lista recuperada com sucesso.',
   schema: {
    properties: {
     data: { type: 'array', items: { $ref: getSchemaPath(TicketTypeResponseDto) } },
     meta: {
      type: 'object',
      properties: {
       totalItems: { type: 'number' },
       itemCount: { type: 'number' },
       itemsPerPage: { type: 'number' },
       totalPages: { type: 'number' },
       currentPage: { type: 'number' },
      },
     },
    },
   },
  }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 FindOne: () => applyDecorators(
  ApiOperation({ summary: 'Busca um lote por ID' }),
  ApiOkResponse({ type: TicketTypeResponseDto }),
  ApiNotFoundResponse({ description: 'Tipo de ingresso não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 Update: () => applyDecorators(
  ApiOperation({
   summary: 'Atualiza um lote de ingressos',
   description: 'Permite editar preço e quantidade. Não permite reduzir a quantidade total para menos do que já foi vendido.'
  }),
  ApiOkResponse({ type: TicketTypeResponseDto }),
  ApiBadRequestResponse({ description: 'A nova quantidade é menor do que os ingressos já vendidos.' }),
  ApiNotFoundResponse({ description: 'Lote não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),

 ),

 Delete: () => applyDecorators(
  ApiOperation({
   summary: 'Remove um lote de ingressos',
   description: 'Realiza soft delete. Bloqueia a exclusão se houver ingressos vendidos no lote.'
  }),
  ApiOkResponse({ description: 'Lote removido com sucesso.' }),
  ApiBadRequestResponse({ description: 'Não é possível excluir um lote que já possui vendas.' }),
  ApiNotFoundResponse({ description: 'Lote não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),
};