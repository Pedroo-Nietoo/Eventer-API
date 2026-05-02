import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

export const SwaggerAppController = {
  Main: () => applyDecorators(ApiTags('App')),

  GetRoot: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Retorna informações e status da API (Público)',
        description:
          'Rota pública na raiz da aplicação. Lê o arquivo package.json e retorna o nome, descrição, versão do projeto e o status atual do serviço.',
      }),
      ApiOkResponse({
        description: 'Informações da API recuperadas com sucesso.',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'meu-projeto-api',
              description: 'Nome do projeto extraído do package.json',
            },
            description: {
              type: 'string',
              example: 'Descrição incrível da minha API',
              description: 'Descrição do projeto extraída do package.json',
            },
            version: {
              type: 'string',
              example: '1.0.0',
              description: 'Versão atual do projeto extraída do package.json',
            },
            status: {
              type: 'string',
              example: 'online',
              description: 'Status de disponibilidade da API',
            },
          },
        },
      }),
      ApiInternalServerErrorResponse({
        description: 'Erro interno do servidor.',
      }),
    ),
};
