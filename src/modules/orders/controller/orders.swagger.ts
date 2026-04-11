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
  ApiExtraModels,
  getSchemaPath,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { OrderResponseDto } from '@orders/dto/order-response.dto';

export const SwaggerOrderController = {
  Main: () => applyDecorators(ApiTags('Orders'), ApiBearerAuth()),

  Create: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Cria um novo pedido',
        description:
          'Inicia o processo de compra, verifica a disponibilidade do ingresso e gera uma sessão de checkout no Stripe.',
      }),
      ApiCreatedResponse({
        description:
          'Pedido salvo com status PENDING e sessão do Stripe criada.',
        schema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            checkoutUrl: {
              type: 'string',
              example: 'https://checkout.stripe.com/c/pay/cs_test_a1B2c3...',
            },
          },
        },
      }),
      ApiBadRequestResponse({
        description: 'Dados de entrada inválidos ou quantidade indisponível.',
      }),
      ApiNotFoundResponse({ description: 'Tipo de ingresso não encontrado.' }),
      ApiInternalServerErrorResponse({
        description: 'Falha ao comunicar com o gateway de pagamento.',
      }),
    ),

  Webhook: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Webhook para eventos do Stripe',
        description:
          'Rota pública utilizada pelo Stripe para notificar a API sobre o status do pagamento (ex: checkout.session.completed).',
      }),
      ApiCreatedResponse({
        description: 'Evento recebido e processado com sucesso.',
        schema: {
          type: 'object',
          properties: {
            received: { type: 'boolean', example: true },
          },
        },
      }),
      ApiBadRequestResponse({
        description:
          'Assinatura do webhook inválida ou ausente (Header stripe-signature).',
      }),
    ),

  FindAll: () =>
    applyDecorators(
      ApiExtraModels(OrderResponseDto),
      ApiOperation({
        summary: 'Lista pedidos paginados',
        description:
          'Retorna uma lista de pedidos e metadados de paginação. Requer token JWT.',
      }),
      ApiOkResponse({
        description: 'Lista recuperada com sucesso.',
        schema: {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(OrderResponseDto) },
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
      ApiOperation({ summary: 'Busca um pedido por ID específico' }),
      ApiOkResponse({ type: OrderResponseDto }),
      ApiNotFoundResponse({
        description: 'Pedido não encontrado no banco de dados.',
      }),
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

  Update: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Atualiza dados do pedido',
        description:
          'Permite atualizar informações manuais do pedido, como o status.',
      }),
      ApiOkResponse({ type: OrderResponseDto }),
      ApiNotFoundResponse({ description: 'Pedido não encontrado.' }),
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
      ApiOperation({
        summary: 'Remove um pedido (Soft Delete)',
        description:
          'Marca o pedido como removido no banco de dados sem deletar o registro fisicamente.',
      }),
      ApiNoContentResponse({ description: 'Pedido removido com sucesso.' }),
      ApiNotFoundResponse({ description: 'Pedido não encontrado.' }),
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
