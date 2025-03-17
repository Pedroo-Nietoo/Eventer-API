import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket gateway for handling notifications.
 *
 * This gateway manages WebSocket connections, authenticates users, and sends notifications
 * to all connected clients or specific clients based on user ID.
 *
 * @class NotificationsGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*', // todo: Allows any origin (ideal for testing, but should be configured properly in production)
  },
})
export class NotificationsGateway {
  /**
   * The WebSocket server instance.
   * This is used to handle WebSocket connections and communication.
   *
   * @type {Server}
   */
  @WebSocketServer()
  server: Server;

  /**
   * A map that associates user IDs with their corresponding socket IDs.
   *
   * @private
   */
  private userSocketMap = new Map<string, string>(); // userId -> socketId

  /**
   * A map that associates socket IDs with their corresponding user IDs.
   *
   * @private
   */
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  /**
   * Handles a new client connection.
   *
   * @param client The connected client socket.
   */
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('authenticate', (data: { userId: string }) => {
      this.userSocketMap.set(data.userId, client.id);
      this.socketUserMap.set(client.id, data.userId);
    });
  }

  /**
   * Handles client disconnection.
   *
   * @param client The disconnected client socket.
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
    }
  }

  /**
   * Sends a notification to all connected clients.
   *
   * @param data The title and message of the notification.
   */
  sendNotificationToAll(data: { title: string; message: string }) {
    this.server.emit('notification', data);
  }

  /**
   * Sends a notification to a specific client, based on the userId.
   *
   * @param userId The user ID to send the notification to.
   * @param data The title and message of the notification.
   */
  sendNotificationToUser(
    userId: string,
    data: { title: string; message: string },
  ) {
    const socketId = this.userSocketMap.get(userId);
    if (socketId) {
      const client = this.server.sockets.sockets.get(socketId);
      if (client) {
        client.emit('notification', data);
      }
    }
  }
}
