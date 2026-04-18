import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiOkResponse,
 ApiServiceUnavailableResponse,
 ApiTags,
} from '@nestjs/swagger';

export const SwaggerHealthController = {
 Main: () => applyDecorators(ApiTags('Health')),

 CheckAll: () =>
  applyDecorators(
   ApiOperation({
    summary: 'Verifica a saúde da aplicação (Público)',
    description:
     'Verifica e devolve o estado atual da API e das suas dependências críticas, incluindo o Banco de Dados (TypeORM), Redis, utilização de Memória e espaço em Disco. Rota pública.',
   }),
   ApiOkResponse({
    description: 'A API e todos os serviços dependentes estão operacionais.',
    schema: {
     type: 'object',
     example: {
      status: 'ok',
      info: {
       database: { status: 'up' },
       redis: { status: 'up' },
       memory_heap: { status: 'up' },
       disk: { status: 'up' },
      },
      error: {},
      details: {
       database: { status: 'up' },
       redis: { status: 'up' },
       memory_heap: { status: 'up' },
       disk: { status: 'up' },
      },
     },
    },
   }),
   ApiServiceUnavailableResponse({
    description:
     'Um ou mais serviços dependentes estão indisponíveis (ex: falha de conexão com o Redis ou Banco de Dados).',
   }),
  ),
};