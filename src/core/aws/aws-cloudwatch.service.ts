import { Injectable, Logger } from '@nestjs/common';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { ConfigService } from '@nestjs/config';

/**
 * Service for interacting with Amazon CloudWatch Logs.
 */
@Injectable()
export class CloudWatchService {
  /**
   * Logger instance for logging messages related to the CloudWatch service.
   * @type {Logger}
   */
  private readonly logger = new Logger(CloudWatchService.name);

  /**
   * The CloudWatch Logs client used for making requests to Amazon CloudWatch.
   * @type {CloudWatchLogsClient}
   */
  private readonly client: CloudWatchLogsClient;

  /**
   * Constructor for the CloudWatchService.
   * Initializes the CloudWatch Logs client with the specified AWS region.
   */
  constructor(private configService: ConfigService) {
    this.client = new CloudWatchLogsClient({
      region: configService.get<string>('AWS_REGION'),
    });
  }

  /**
   * Logs an error message to the specified CloudWatch log group and stream.
   *
   * @param {string} logGroupName - The name of the log group where the error will be logged.
   * @param {string} logStreamName - The name of the log stream where the error will be logged.
   * @param {any} errorLog - The error log object to be sent to CloudWatch.
   * @returns {Promise<void>} - A promise that resolves when the log is successfully sent.
   * @throws {Error} - Throws an error if the log could not be sent to CloudWatch.
   */
  async logError(errorLog: any): Promise<void> {
    const params = {
      logGroupName: this.configService.get<string>('CLOUDWATCH_LOG_GROUP'),
      logStreamName: this.configService.get<string>('CLOUDWATCH_LOG_STREAM'),
      logEvents: [
        {
          message: JSON.stringify(errorLog),
          timestamp: Date.now(),
        },
      ],
    };

    try {
      const command = new PutLogEventsCommand(params);
      await this.client.send(command);
      this.logger.log('Log sent successfully to CloudWatch! 🌥️');
    } catch (err) {
      this.logger.error('Error sending log to CloudWatch:', err);
      throw new Error(`Could not send log to CloudWatch: ${err.message}`);
    }
  }
}
