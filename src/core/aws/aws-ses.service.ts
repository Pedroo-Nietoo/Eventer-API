// import { Injectable, Logger } from '@nestjs/common';
// import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class SESService {
//   private readonly logger = new Logger(SESService.name);
//   private sesClient: SESClient;

//   constructor(private configService: ConfigService) {
//     const region = this.configService.get<string>('AWS_REGION');
//     const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID')!;
//     const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!;

//     this.sesClient = new SESClient({
//       region,
//       credentials: {
//         accessKeyId,
//         secretAccessKey,
//       },
//     });
//   }

//   async sendEmail(
//     to: string,
//     subject: string,
//     bodyHtml: string,
//     bodyText: string,
//     from?: string,
//   ): Promise<void> {
//     const sender = from || this.configService.get<string>('AWS_SES_EMAIL_FROM');

//     const params = {
//       Source: sender,
//       Destination: {
//         ToAddresses: [to],
//       },
//       Message: {
//         Subject: {
//           Data: subject,
//         },
//         Body: {
//           Html: {
//             Data: bodyHtml,
//           },
//           Text: {
//             Data: bodyText,
//           },
//         },
//       },
//     };

//     try {
//       const command = new SendEmailCommand(params);
//       await this.sesClient.send(command);
//       this.logger.log(`Email sent to ${to} successfully! 📧`);
//     } catch (error) {
//       this.logger.error(`Failed to send email: ${error.message}`, error.stack);
//       throw new Error(`Could not send email: ${error.message}`);
//     }
//   }
// }
