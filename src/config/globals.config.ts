import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as rtracer from 'cls-rtracer';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';

export function setupGlobals(app: INestApplication) {
 app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

 app.useGlobalInterceptors(new LoggingInterceptor());

 app.use(rtracer.expressMiddleware({
  useHeader: true,
  headerName: 'x-trace-id',
 }));

 app.useGlobalPipes(
  new ValidationPipe({
   whitelist: true,
   transform: true,
   stopAtFirstError: true,
  }),
 );

 app.useGlobalFilters(new HttpExceptionFilter());
}