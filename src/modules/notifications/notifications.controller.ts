import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * NotificationsController handles all notification-related HTTP requests.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * HTTP route to trigger a notification to all connected clients.
   * @param body Contains the title and message of the notification.
   * @returns Success message.
   */
  @Post('all')
  triggerNotificationToAll(@Body() body: CreateNotificationDto) {
    this.notificationsService.sendNotificationToAll(body.title, body.message);
    return { message: 'Notification sent to all users!' };
  }

  /**
   * HTTP route to trigger a notification to a specific user.
   * @param body Contains the title, message, and user ID.
   * @returns Success message.
   */
  @Post(':userId')
  triggerNotificationToUser(
    @Param() userId: string,
    @Body() body: CreateNotificationDto,
  ) {
    this.notificationsService.sendNotificationToUser(
      userId,
      body.title,
      body.message,
    );
    return { message: 'Notification sent to the user!' };
  }

  /**
   * HTTP route to fetch the notification history of a specific user.
   * @param body Contains the user ID to fetch notifications for.
   * @returns A list of notifications.
   */
  @Get('history/:userId')
  async getNotificationsHistory(@Param() userId: string) {
    const notifications =
      await this.notificationsService.getNotificationsByUser(userId);
    return notifications;
  }

  /**
   * HTTP route to update a notification for a specific user.
   * @param notificationId The ID of the notification to update.
   * @param body Contains the updated title and message.
   * @returns Success message.
   */
  @Post('update/:notificationId')
  async updateNotification(
    @Param('notificationId') notificationId: string,
    @Body() body: CreateNotificationDto,
  ) {
    await this.notificationsService.updateNotification(
      notificationId,
      body.title,
      body.message,
    );
    return { message: 'Notification updated successfully!' };
  }

  /**
   * HTTP route to delete a notification for a specific user.
   * @param notificationId The ID of the notification to delete.
   * @returns Success message.
   */
  @Post('delete/:notificationId')
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.notificationsService.deleteNotification(notificationId);
    return { message: 'Notification deleted successfully!' };
  }
}
