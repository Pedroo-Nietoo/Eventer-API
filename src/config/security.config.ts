import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

export function setupSecurity(app: NestExpressApplication, configService: ConfigService) {
 app.set('trust proxy', 1);

 app.enableCors({
  origin: configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
 });

 app.use(helmet({
  contentSecurityPolicy: {
   directives: {
    defaultSrc: [`'self'`],
    scriptSrc: [`'self'`],
    styleSrc: [`'self'`, `'unsafe-inline'`],
    imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
    frameAncestors: [`'none'`],
    connectSrc: [`'self'`, ...configService.get('CORS_ORIGINS')?.split(',') || []],
    objectSrc: [`'none'`],
    upgradeInsecureRequests: [],
   },
  },
 }));
}