import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  /**
   * The title of the notification.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  title: string;

  /**
   * The content of the notification.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  message: string;

  /**
   * The user id of the notification.
   * @type {string}
   */
  @IsOptional()
  @IsString()
  userId: string;
}
