import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric-transformer';
import { TicketType } from 'src/modules/ticket-types/entities/ticket-type.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, DeleteDateColumn } from 'typeorm';

export enum TicketStatus {
 VALID = 'VALID',
 USED = 'USED',
 CANCELLED = 'CANCELLED'
}

@Entity('tickets')
export class Ticket {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Index({ unique: true })
 @Column({ name: 'qr_code', unique: true })
 qrCode: string;

 @Column({
  type: 'enum',
  enum: TicketStatus,
  default: TicketStatus.VALID,
 })
 status: TicketStatus;

 @ManyToOne(() => User)
 @JoinColumn({ name: 'user_id' })
 user: User;

 @ManyToOne(() => TicketType)
 @JoinColumn({ name: 'ticket_type_id' })
 ticketType: TicketType;

 @Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: new ColumnNumericTransformer(),
  name: 'purchase_price',
  nullable: true
 })
 purchasePrice: number;

 @Index()
 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}