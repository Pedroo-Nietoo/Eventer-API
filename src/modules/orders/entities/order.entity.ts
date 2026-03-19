import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { TicketType } from 'src/modules/ticket-types/entities/ticket-type.entity';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric-transformer';
import { OrderStatus } from 'src/common/enums/order-status.enum';



@Entity('orders')
@Index(['status', 'createdAt'])
export class Order {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Index({ unique: true })
 @Column({ unique: true, name: 'stripe_session_id', nullable: true })
 stripeSessionId: string;

 @Column({
  type: 'enum',
  enum: OrderStatus,
  default: OrderStatus.PENDING,
 })
 status: OrderStatus;

 @ManyToOne(() => User)
 @JoinColumn({ name: 'user_id' })
 user: User;

 @Column({ name: 'user_id' })
 userId: string;

 @ManyToOne(() => TicketType)
 @JoinColumn({ name: 'ticket_type_id' })
 ticketType: TicketType;

 @Column({ name: 'ticket_type_id' })
 ticketTypeId: string;

 @Column({ type: 'int', default: 1 })
 quantity: number;

 @Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: new ColumnNumericTransformer(),
  name: 'unit_price'
 })
 unitPrice: number;

 @Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: new ColumnNumericTransformer(),
  name: 'total_price'
 })
 totalPrice: number;

 @Index()
 @CreateDateColumn({
  name: 'created_at',
  type: 'timestamptz'
 })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}