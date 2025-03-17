import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

/**
 * Service for interacting with Amazon S3.
 */
@Injectable()
export class S3Service {
  /**
   * The S3 client used for making requests to Amazon S3.
   * @type {S3Client}
   */
  private s3Client: S3Client;

  /**
   * Logger instance for logging messages related to the S3 service.
   * @type {Logger}
   */
  private readonly logger = new Logger(S3Service.name);

  /**
   * Constructor for the S3Service.
   * Initializes the S3 client with AWS credentials and region.
   */
  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException('Missing AWS configuration on ENV file');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Uploads an image to the specified S3 bucket.
   *
   * @param {string} bucket - The name of the S3 bucket where the image will be stored.
   * @param {string} key - The key (name) for the S3 object.
   * @param {Buffer} body - The content of the image in Buffer format.
   * @param {string} contentType - The content type of the image (e.g., 'image/png').
   * @returns {Promise<string>} - URL of the stored image in S3.
   * @throws {Error} - Throws an error if the upload fails.
   */
  async uploadImage(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(
        `Failed to upload image to S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Could not upload image: ${error.message}`);
    }
  }

  /**
   * Downloads an image from the specified S3 bucket.
   *
   * @param {string} bucket - The name of the S3 bucket from which the image will be downloaded.
   * @param {string} key - The key (name) of the S3 object.
   * @returns {Promise<Buffer>} - The content of the image in Buffer format.
   * @throws {Error} - Throws an error if the download fails.
   */
  async downloadImage(key: string): Promise<Buffer> {
    const bucket = this.configService.get<string>('AWS_BUCKET_NAME');

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      const { Body } = await this.s3Client.send(command);
      const stream = Body as Readable;
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (error) => {
          this.logger.error(
            `Error reading from stream: ${error.message}`,
            error.stack,
          );
          reject(error);
        });
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(
        `Failed to download image from S3: ${error.message}`,
        error.stack,
      );
      throw new Error(`Could not download image: ${error.message}`);
    }
  }
}