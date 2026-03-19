import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
 @ApiProperty({ enum: OrderStatus, required: false })
 @IsOptional()
 @IsEnum(OrderStatus)
 status?: OrderStatus;
}