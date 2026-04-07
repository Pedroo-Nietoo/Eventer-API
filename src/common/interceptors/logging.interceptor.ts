import {
 CallHandler,
 ExecutionContext,
 Injectable,
 Logger,
 NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithStartTime extends Request {
 startTime?: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
 private readonly logger = new Logger('HTTP');

 intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const ctx = context.switchToHttp();
  const request = ctx.getRequest<RequestWithStartTime>();
  const response = ctx.getResponse<Response>();

  request.startTime = Date.now();

  return next.handle().pipe(
   tap(() => {
    const durationMs = request.startTime ? Date.now() - request.startTime : 0;

    const logData = {
     event: 'http_request_success',
     method: request.method,
     url: request.originalUrl,
     statusCode: response.statusCode,
     durationMs,
    };

    this.logger.log(JSON.stringify(logData));
   }),
  );
 }
}