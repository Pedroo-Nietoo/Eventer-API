import { WinstonModuleAsyncOptions, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as rtracer from 'cls-rtracer';
import CloudWatchTransport from 'winston-cloudwatch';
import { ConfigService } from '@nestjs/config';

const traceIdFormat = winston.format((info) => {
 const traceId = rtracer.id();
 if (traceId) {
  info.message = `[Trace: ${traceId}] ${info.message}`;
 }
 return info;
});

export const loggerConfigAsync: WinstonModuleAsyncOptions = {
 inject: [ConfigService],
 useFactory: (configService: ConfigService) => {
  return {
   transports: [
    new winston.transports.Console({
     format: winston.format.combine(
      winston.format.timestamp(),
      traceIdFormat(),
      nestWinstonUtilities.format.nestLike('Nearby API', {
       colors: true,
      }),
     ),
    }),
    new CloudWatchTransport({
     name: 'CloudWatch',
     logGroupName: configService.get<string>('AWS_CLOUDWATCH_LOG_GROUP') || 'nearby-api-logs',
     logStreamName: `api-${configService.get<string>('NODE_ENV') || 'development'}`,
     awsOptions: {
      region: configService.get<string>('AWS_REGION'),
      credentials: {
       accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') as string,
       secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') as string,
      },
     },
     messageFormatter: (info: any) => {
      let parsedMessage: any = {};

      try {
       parsedMessage = JSON.parse(info.message);
      } catch (error) {
       parsedMessage = { message: info.message };
      }

      const finalLog: any = {
       level: info.level,
       context: info.context,
       traceId: rtracer.id() || parsedMessage.traceId || info.traceId,
       ...parsedMessage,
      };

      if (info.stack) {
       finalLog.stack = info.stack;
      }

      return JSON.stringify(finalLog);
     },
    }),
   ],
  };
 },
};