import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // todo: Allows any origin (ideal for testing, but should be configured properly in production)
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Map userId to socketId
  private userSocketMap = new Map<string, string>(); // userId -> socketId
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('authenticate', (data: { userId: string }) => {
      this.userSocketMap.set(data.userId, client.id);
      this.socketUserMap.set(client.id, data.userId);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove mapping when the client disconnects
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
    }
  }

  /**
   * Sends a notification to all connected clients.
   * @param data The title and message of the notification.
   */
  sendNotificationToAll(data: { title: string; message: string }) {
    this.server.emit('notification', data);
  }

  /**
   * Sends a notification to a specific client, based on the userId.
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
