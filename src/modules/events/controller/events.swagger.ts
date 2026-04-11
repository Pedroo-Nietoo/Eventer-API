import { EventResponseDto } from '@events/dto/event-response.dto';
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
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiExtraModels,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';

export const SwaggerEventController = {
  Main: () => applyDecorators(ApiTags('Events'), ApiBearerAuth()),

  Create: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Cria um novo evento (ADMIN)',
        description:
          'Cria um evento com geolocalização. O slug é gerado automaticamente se não for enviado.',
      }),
      ApiCreatedResponse({
        description: 'Evento criado com sucesso.',
        type: EventResponseDto,
      }),
      ApiConflictResponse({ description: 'O slug deste evento já existe.' }),
      ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description:
          'Acesso negado. Apenas administradores podem criar eventos.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  FindNearby: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Busca eventos próximos',
        description:
          'Retorna eventos em um raio de distância baseado em latitude e longitude.',
      }),
      ApiQuery({
        name: 'lat',
        type: Number,
        description: 'Latitude',
        example: -23.55052,
      }),
      ApiQuery({
        name: 'lng',
        type: Number,
        description: 'Longitude',
        example: -46.633308,
      }),
      ApiQuery({
        name: 'radius',
        type: Number,
        description: 'Raio em metros',
        example: 5000,
      }),
      ApiOkResponse({
        description: 'Eventos próximos recuperados com sucesso.',
        type: [EventResponseDto],
      }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  FindAll: () =>
    applyDecorators(
      ApiExtraModels(EventResponseDto),
      ApiOperation({
        summary: 'Lista todos os eventos',
        description: 'Retorna uma lista paginada de eventos.',
      }),
      ApiOkResponse({
        description: 'Lista de eventos recuperada com sucesso.',
        schema: {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(EventResponseDto) },
            },
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
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  FindOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Busca evento por ID' }),
      ApiOkResponse({ type: EventResponseDto }),
      ApiNotFoundResponse({ description: 'Evento não encontrado.' }),
      ApiBadRequestResponse({
        description: 'ID enviado não é um UUID válido.',
      }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  FindBySlug: () =>
    applyDecorators(
      ApiOperation({ summary: 'Busca evento pelo Slug' }),
      ApiOkResponse({ type: EventResponseDto }),
      ApiNotFoundResponse({
        description: 'Evento não encontrado com este slug.',
      }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  Update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Atualiza um evento' }),
      ApiOkResponse({ type: EventResponseDto }),
      ApiNotFoundResponse({ description: 'Evento não encontrado.' }),
      ApiConflictResponse({
        description: 'Conflito de dados no evento (slug já existente).',
      }),
      ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),

  Delete: () =>
    applyDecorators(
      ApiOperation({ summary: 'Remove um evento' }),
      ApiNoContentResponse({ description: 'Evento removido com sucesso.' }),
      ApiNotFoundResponse({ description: 'Evento não encontrado.' }),
      ApiUnauthorizedResponse({
        description: 'Acesso negado. Autenticação necessária.',
      }),
      ApiForbiddenResponse({
        description: 'Acesso negado. Sem permissão para acessar o recurso.',
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),
};
