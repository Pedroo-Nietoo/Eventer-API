import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

export function setupSecurity(
  app: NestExpressApplication,
  configService: ConfigService,
) {
  app.set('trust proxy', 1);

  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  const parsedOrigins = corsOrigins
    ? corsOrigins.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: parsedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const cloudFrontUrl = configService.get<string>('AWS_CLOUDFRONT_URL') || '';

  const cloudFrontDomain = cloudFrontUrl ? new URL(cloudFrontUrl).hostname : '';

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [
            `'self'`,
            'data:',
            'validator.swagger.io',
            cloudFrontDomain,
          ].filter(Boolean),
          frameAncestors: [`'none'`],
          connectSrc: [
            `'self'`,
            ...(corsOrigins ? corsOrigins.split(',') : []),
          ],
          objectSrc: [`'none'`],

          ...(isProduction ? { upgradeInsecureRequests: [] } : {}),
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
}
