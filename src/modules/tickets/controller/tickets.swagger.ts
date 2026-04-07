import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiCreatedResponse,
 ApiOkResponse,
 ApiNoContentResponse,
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
import { TicketResponseDto } from '@tickets/dto/ticket-response.dto';
import { ValidateTicketResponseDto } from '@tickets/dto/validate-ticket-response.dto';

export const SwaggerTicketController = {
 Main: () => applyDecorators(
  ApiTags('Tickets'),
  ApiBearerAuth(),
 ),

 Create: () => applyDecorators(
  ApiOperation({ summary: 'Emite um novo ingresso', description: 'Cria o ingresso, abate do estoque e envia e-mail com QR Code.' }),
  ApiCreatedResponse({ description: 'Ingresso emitido.', type: TicketResponseDto }),
  ApiBadRequestResponse({ description: 'Lote esgotado ou dados inválidos.' }),
  ApiNotFoundResponse({ description: 'Usuário ou Lote não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno no servidor.' }),
 ),

 Validate: () => applyDecorators(
  ApiOperation({ summary: 'Valida um QR Code', description: 'Valida o JWT do QR Code e marca como USED.' }),
  ApiOkResponse({ description: 'Resultado da validação.', type: ValidateTicketResponseDto }),
  ApiBadRequestResponse({ description: 'QR Code inválido ou já utilizado/cancelado.' }),
  ApiNotFoundResponse({ description: 'Ingresso não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 FindAll: () => applyDecorators(
  ApiExtraModels(TicketResponseDto),
  ApiOperation({ summary: 'Lista ingressos paginados' }),
  ApiOkResponse({
   description: 'Lista recuperada.',
   schema: {
    properties: {
     data: { type: 'array', items: { $ref: getSchemaPath(TicketResponseDto) } },
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
  ApiOperation({ summary: 'Busca um ingresso por ID' }),
  ApiOkResponse({ type: TicketResponseDto }),
  ApiNotFoundResponse({ description: 'Ingresso não encontrado.' }),
  ApiBadRequestResponse({ description: 'UUID inválido.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 Update: () => applyDecorators(
  ApiOperation({ summary: 'Atualiza um ingresso', description: 'Altera status ou troca lote com gestão de estoque.' }),
  ApiOkResponse({ type: TicketResponseDto }),
  ApiBadRequestResponse({ description: 'Estoque insuficiente ou erro na atualização.' }),
  ApiNotFoundResponse({ description: 'Ingresso ou novo lote não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),

 Delete: () => applyDecorators(
  ApiOperation({ summary: 'Cancela um ingresso', description: 'Marca como cancelado e devolve vaga ao estoque.' }),
  ApiNoContentResponse({ description: 'Cancelado com sucesso.' }),
  ApiBadRequestResponse({ description: 'Ingresso já utilizado ou cancelado.' }),
  ApiNotFoundResponse({ description: 'Ingresso não encontrado.' }),
  ApiUnauthorizedResponse({ description: 'Acesso negado. Autenticação necessária.' }),
  ApiForbiddenResponse({ description: 'Acesso negado. Sem permissão para acessar o recurso.' }),
  ApiInternalServerErrorResponse({ description: 'Erro interno do servidor.' }),
 ),
};