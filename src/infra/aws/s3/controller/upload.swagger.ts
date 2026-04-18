import { applyDecorators } from '@nestjs/common';
import {
 ApiOperation,
 ApiCreatedResponse,
 ApiTags,
 ApiBearerAuth,
 ApiBadRequestResponse,
 ApiInternalServerErrorResponse,
 ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const SwaggerUploadController = {
 Main: () => applyDecorators(ApiTags('Uploads'), ApiBearerAuth()),

 GetPresignedUrl: () =>
  applyDecorators(
   ApiOperation({
    summary: 'Gera uma Presigned URL para upload',
    description:
     'Gera uma URL temporária do AWS S3 para permitir o upload direto pelo cliente (front-end), juntamente com a URL final pública do ficheiro no CloudFront.',
   }),
   ApiCreatedResponse({
    description: 'URLs geradas com sucesso.',
    schema: {
     type: 'object',
     properties: {
      presignedUrl: {
       type: 'string',
       description: 'URL temporária do S3 para fazer o PUT do ficheiro.',
       example:
        'https://nearby-api-bucket.s3.us-east-1.amazonaws.com/users/1234abcd.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
      },
      finalUrl: {
       type: 'string',
       description: 'URL pública final do ficheiro via CloudFront.',
       example: 'https://cdn.nearbyapi.com/users/1234abcd.jpeg',
      },
     },
    },
   }),
   ApiBadRequestResponse({
    description: 'Dados de entrada inválidos (validação do DTO falhou).',
   }),
   ApiUnauthorizedResponse({
    description: 'Acesso negado. Autenticação necessária.',
   }),
   ApiInternalServerErrorResponse({
    description: 'Erro ao gerar URL de upload temporária na AWS.',
   }),
  ),
};