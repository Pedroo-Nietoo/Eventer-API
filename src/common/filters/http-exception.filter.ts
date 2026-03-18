import {
 ExceptionFilter,
 Catch,
 ArgumentsHost,
 HttpException,
 HttpStatus,
 Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
 private readonly logger = new Logger('HttpException');

 catch(exception: HttpException, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  const status = exception.getStatus();
  const exceptionResponse = exception.getResponse() as any;

  const errorMappings: Record<number, string> = {
   [HttpStatus.UNAUTHORIZED]: 'Acesso negado. Autenticação necessária.',
   [HttpStatus.FORBIDDEN]: 'Você não tem permissão para acessar este recurso.',
   [HttpStatus.TOO_MANY_REQUESTS]: 'Excesso de requisições realizadas. Por favor, tente novamente mais tarde.',
   [HttpStatus.INTERNAL_SERVER_ERROR]: 'Erro interno no servidor.',
  };

  let message = errorMappings[status] || (typeof exceptionResponse === 'object' ? exceptionResponse.message : exceptionResponse);
  let details = [];

  if (Array.isArray(exceptionResponse.message)) {
   message = 'Erro de validação nos dados enviados.';
   details = exceptionResponse.message;
  }

  const errorType = exceptionResponse.error || exception.name;

  this.logger.error(
   `${request.method} ${request.url} - Status: ${status} - Error: ${errorType} - Msg: ${Array.isArray(details) && details.length > 0 ? JSON.stringify(details) : message}`,
  );

  response.status(status).json({
   statusCode: status,
   error: errorType,
   message: message,
   details: details.length > 0 ? details : undefined,
   timestamp: new Date().toISOString(),
   path: request.url,
  });
 }
}