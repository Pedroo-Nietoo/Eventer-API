import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a notification.
 */
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
