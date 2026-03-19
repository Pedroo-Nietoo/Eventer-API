import { OrderStatus } from 'src/common/enums/order-status.enum';

export class OrderResponseDto {
 id: string;
 userId: string;
 ticketTypeId: string;
 quantity: number;
 unitPrice: number;
 totalPrice: number;
 status: OrderStatus;
 createdAt: Date;
 updatedAt: Date;
}