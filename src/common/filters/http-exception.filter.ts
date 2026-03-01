import {
 ExceptionFilter,
 Catch,
 ArgumentsHost,
 HttpException,
 HttpStatus,
 Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
 private readonly logger = new Logger(HttpExceptionFilter.name);

 catch(exception: HttpException, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request>();

  const status = exception.getStatus();
  const exceptionResponse = exception.getResponse() as any;

  let message = 'Ocorreu um erro na requisição.';
  let details = [];
  const errorType = exceptionResponse.error || exception.name;

  if (typeof exceptionResponse === 'object') {
   if (Array.isArray(exceptionResponse.message)) {
    message = 'Erro de validação dos dados enviados.';
    details = exceptionResponse.message;
   } else {
    message = exceptionResponse.message || message;
   }
  } else if (typeof exceptionResponse === 'string') {
   message = exceptionResponse;
  }

  if (status === HttpStatus.UNAUTHORIZED && message === 'Unauthorized') {
   message = 'Acesso negado. Autenticação é necessária para acessar este recurso.';
  }

  if (status === HttpStatus.FORBIDDEN && message === 'Forbidden resource') {
   message = 'Acesso negado. Você não tem permissão para acessar esse recurso.';
  }

  this.logger.error(
   JSON.stringify({
    statusCode: status,
    error: errorType,
    message: message,
    details: details,
   }));

  response.status(status).json({
   timestamp: new Date().toISOString(),
   statusCode: status,
   error: errorType,
   message: message,
   details: details.length > 0 ? details : undefined,
   path: request.url,
  });
 }
}