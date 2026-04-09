import {
 ExceptionFilter,
 Catch,
 ArgumentsHost,
 HttpException,
 HttpStatus,
 Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '@common/decorators/current-user.decorator';

interface ExtendedRequest extends Request {
 startTime?: number;
 user?: AuthenticatedUser & { sub?: string };
}

interface HttpExceptionResponse {
 message?: string | string[];
 error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
 private readonly logger = new Logger('HttpException');

 catch(exception: unknown, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const request = ctx.getRequest<ExtendedRequest>();

  const durationMs = request.startTime ? Date.now() - request.startTime : null;

  let status = HttpStatus.INTERNAL_SERVER_ERROR;
  let message: string | string[] = 'Erro interno no servidor.';
  let errorType = 'InternalServerError';
  let details: string[] | undefined;

  const stack = exception instanceof Error ? exception.stack : undefined;

  if (exception instanceof HttpException) {
   status = exception.getStatus();
   const exceptionResponse = exception.getResponse();

   if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
    errorType = exception.name;
   } else if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null
   ) {
    const typedResponse = exceptionResponse as HttpExceptionResponse;

    if (Array.isArray(typedResponse.message)) {
     message = 'Erro de validação nos dados enviados.';
     details = typedResponse.message;
    } else if (typedResponse.message) {
     message = typedResponse.message;
    }

    errorType = typedResponse.error || exception.name;
   } else {
    errorType = exception.name;
   }
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

  const rawBody = request.body as unknown;
  let sanitizedBody: Record<string, unknown> = {};

  if (typeof rawBody === 'object' && rawBody !== null) {
   sanitizedBody = { ...(rawBody as Record<string, unknown>) };
   if ('password' in sanitizedBody) {
    sanitizedBody.password = '***Omitted***';
   }
  }

  const queryObj = request.query as Record<string, unknown>;
  const paramsObj = request.params as Record<string, unknown>;

  const errorContext = {
   body: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : undefined,
   query: Object.keys(queryObj).length > 0 ? queryObj : undefined,
   params: Object.keys(paramsObj).length > 0 ? paramsObj : undefined,
   userId: request.user?.sub || request.user?.id || 'Unauthenticated',
   clientIp: request.ip,
  };

  const errorLogData = {
   event: 'http_request_error',
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
   timestamp: new Date().toISOString(),
   path: request.url,
  });
 }
}