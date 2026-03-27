import {
 CallHandler,
 ExecutionContext,
 Injectable,
 Logger,
 NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
 private readonly logger = new Logger('HTTP');

 intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const ctx = context.switchToHttp();
  const request = ctx.getRequest();
  const response = ctx.getResponse();

  request.startTime = Date.now();

  return next.handle().pipe(
   tap(() => {
    const durationMs = Date.now() - request.startTime;

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