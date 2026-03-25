import {
 ExceptionFilter,
 Catch,
 ArgumentsHost,
 HttpException,
 HttpStatus,
 Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as randomUUID } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
 private readonly logger = new Logger('HttpException');

 catch(exception: unknown, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<Request & { traceId?: string; startTime?: number; user?: any }>();

  const traceId = request.traceId || request.headers['x-trace-id'] || randomUUID();
  const durationMs = request.startTime ? Date.now() - request.startTime : null;

  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string | string[] = 'Erro interno no servidor.';
  let errorType = 'InternalServerError';
  let details: string[] | undefined;

  const stack = exception instanceof Error ? exception.stack : undefined;

  if (exception instanceof HttpException) {
   status = exception.getStatus();
   const exceptionResponse = exception.getResponse() as any;

   if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
   } else if (Array.isArray(exceptionResponse?.message)) {
    message = 'Erro de validação nos dados enviados.';
    details = exceptionResponse.message;
   } else if (exceptionResponse?.message) {
    message = exceptionResponse.message;
   }

   errorType = exceptionResponse?.error || exception.name;
  }

  const errorMappings: Record<number, string> = {
   [HttpStatus.UNAUTHORIZED]: 'Acesso negado. Autenticação necessária.',
   [HttpStatus.FORBIDDEN]: 'Você não tem permissão para acessar este recurso.',
   [HttpStatus.TOO_MANY_REQUESTS]: 'Excesso de requisições realizadas. Por favor, tente novamente mais tarde.',
   [HttpStatus.INTERNAL_SERVER_ERROR]: 'Erro interno no servidor.',
  };

  if (!message || (typeof message === 'string' && message.trim() === '')) {
   message = errorMappings[status] || 'Erro inesperado.';
  }

  const sanitizedBody = { ...request.body };
  if (sanitizedBody.password) {
   sanitizedBody.password = '***Omitted***';
  }

  const errorContext = {
   body: Object.keys(sanitizedBody).length ? sanitizedBody : undefined,
   query: Object.keys(request.query).length ? request.query : undefined,
   params: Object.keys(request.params).length ? request.params : undefined,
   userId: request.user?.sub || request.user?.id || 'Unauthenticated',
   clientIp: request.ip,
  };

  const errorLogData = {
   event: 'http_request_error',
   traceId,
   method: request.method,
   url: request.url,
   statusCode: status,
   durationMs,
   errorType,
   message: Array.isArray(details) && details.length > 0 ? details : message,
   context: errorContext,
  };

  this.logger.error(
   JSON.stringify(errorLogData),
   stack
  );

  response.status(status).json({
   statusCode: status,
   error: errorType,
   message,
   details,
   traceId,
   timestamp: new Date().toISOString(),
   path: request.url,
  });
 }
}