import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaService } from '@src/database/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sends a notification to all connected clients.
   * It also stores the notification in the database.
   * @param title The title of the notification.
   * @param message The message of the notification.
   */
  async sendNotificationToAll(title: string, message: string) {
    try {
      await this.prisma.notification.createMany({
        data: {
          title,
          message,
        },
      });

      this.notificationsGateway.sendNotificationToAll({ title, message });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Sends a notification to a specific client.
   * It also stores the notification in the database.
   * @param userId The ID of the user to send the notification to.
   * @param title The title of the notification.
   * @param message The message of the notification.
   */
  async sendNotificationToUser(userId: string, title: string, message: string) {
    try {
      await this.prisma.notification.create({
        data: {
          title,
          message,
          userId,
        },
      });

      this.notificationsGateway.sendNotificationToUser(userId, {
        title,
        message,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Retrieves notifications for a specific user.
   * @param userId The ID of the user to fetch notifications for.
   * @returns A list of notifications.
   */
  async getNotificationsByUser(userId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Updates a specific notification for a user.
   * @param notificationId The ID of the notification to update.
   * @param title The updated title of the notification.
   * @param message The updated message of the notification.
   * @returns The updated notification.
   */
  async updateNotification(
    notificationId: string,
    title: string,
    message: string,
  ) {
    try {
      const notification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: { title, message },
      });
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Deletes a specific notification for a user.
   * @param notificationId The ID of the notification to delete.
   * @returns A success message.
   */
  async deleteNotification(notificationId: string) {
    try {
      await this.prisma.notification.delete({
        where: { id: notificationId },
      });
      return { message: 'Notification deleted successfully!' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
