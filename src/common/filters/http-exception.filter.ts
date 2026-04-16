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

interface ParsedException {
  status: number;
  message: string | string[];
  errorType: string;
  details?: string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<ExtendedRequest>();

    const exceptionData = this.parseException(exception);
    const context = this.getErrorContext(request);
    const durationMs = request.startTime
      ? Date.now() - request.startTime
      : null;
    const stack = exception instanceof Error ? exception.stack : undefined;

    const errorLogData = {
      event: 'http_request_error',
      method: request.method,
      url: request.url,
      statusCode: exceptionData.status,
      durationMs,
      errorType: exceptionData.errorType,
      message: exceptionData.details || exceptionData.message,
      context,
    };

    this.logger.error(JSON.stringify(errorLogData), stack);

    response.status(exceptionData.status).json({
      statusCode: exceptionData.status,
      error: exceptionData.errorType,
      message: exceptionData.message,
      details: exceptionData.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private parseException(exception: unknown): ParsedException {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = '';
    let errorType = 'InternalServerError';
    let details: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      const parsed = this.extractHttpExceptionData(res, exception.name);

      message = parsed.message ?? '';
      errorType = parsed.errorType || exception.name;
      details = parsed.details;
    }

    message = this.applyDefaultStatusMessages(status, message);

    return { status, message, errorType, details };
  }

  private extractHttpExceptionData(res: string | object, defaultName: string) {
    if (typeof res === 'string') {
      return { message: res, errorType: defaultName };
    }

    const typedRes = res as HttpExceptionResponse;
    const isValidationError = Array.isArray(typedRes.message);

    return {
      message: isValidationError
        ? 'Erro de validação nos dados enviados.'
        : typedRes.message,
      details: isValidationError ? (typedRes.message as string[]) : undefined,
      errorType: typedRes.error || defaultName,
    };
  }

  private applyDefaultStatusMessages(
    status: number,
    currentMessage: string | string[],
  ): string | string[] {
    const errorMappings: Record<number, string> = {
      [HttpStatus.UNAUTHORIZED]: 'Acesso negado. Autenticação necessária.',
      [HttpStatus.FORBIDDEN]:
        'Você não tem permissão para acessar este recurso.',
      [HttpStatus.TOO_MANY_REQUESTS]:
        'Excesso de requisições realizadas. Por favor, tente novamente mais tarde.',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Erro interno no servidor.',
    };

    const isEmpty =
      !currentMessage ||
      (typeof currentMessage === 'string' && currentMessage.trim() === '');
    return isEmpty
      ? errorMappings[status] || 'Erro inesperado.'
      : currentMessage;
  }

  private getErrorContext(request: ExtendedRequest) {
    return {
      body: this.getSanitizedBody(request.body as unknown),
      query: this.getEmptyAsUndefined(request.query as unknown),
      params: this.getEmptyAsUndefined(request.params as unknown),
      userId: request.user?.sub || request.user?.id || 'Unauthenticated',
      clientIp: request.ip,
    };
  }

  private getSanitizedBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {
      ...(body as Record<string, unknown>),
    };

    if ('password' in sanitized) {
      sanitized.password = '***Omitted***';
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  private getEmptyAsUndefined(
    obj: unknown,
  ): Record<string, unknown> | undefined {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const record = obj as Record<string, unknown>;
      return Object.keys(record).length > 0 ? record : undefined;
    }
    return undefined;
  }
}
