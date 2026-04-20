import {
  WinstonModuleAsyncOptions,
  utilities as nestWinstonUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';
import { ConfigService } from '@nestjs/config';

interface LogInfo {
  level: string;
  message: string;
  context?: string;
  stack?: string;
}

export const loggerConfigAsync: WinstonModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonUtilities.format.nestLike('Eventer API', {
              colors: true,
            }),
          ),
        }),
        new CloudWatchTransport({
          name: 'CloudWatch',
          logGroupName:
            configService.get<string>('AWS_CLOUDWATCH_LOG_GROUP') ||
            'nearby-api-logs',
          logStreamName: `api-${configService.get<string>('NODE_ENV') || 'development'}`,
          retentionInDays:
            Number(configService.get('AWS_CLOUDWATCH_LOG_RETENTION_DAYS')) || 1,
          silent: configService.get<string>('NODE_ENV') === 'production',
          errorHandler: (err: unknown) => {
            console.error('Erro no CloudWatch:', err);
          },
          awsOptions: {
            region: configService.get<string>('AWS_REGION'),
            credentials: {
              accessKeyId: configService.get<string>(
                'AWS_ACCESS_KEY_ID',
              ) as string,
              secretAccessKey: configService.get<string>(
                'AWS_SECRET_ACCESS_KEY',
              ) as string,
            },
          },

          messageFormatter: (info: LogInfo) => {
            let parsedMessage: Record<string, unknown> = {};

            try {
              parsedMessage = JSON.parse(info.message) as Record<
                string,
                unknown
              >;
            } catch {
              parsedMessage = { message: info.message };
            }

            const finalLog: Record<string, unknown> = {
              level: info.level,
              context: info.context,
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
