import { TicketType } from 'src/modules/ticket_type/entities/ticket_type.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from 'typeorm';

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

 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;
}