import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric-transformer';
import { Event } from 'src/modules/events/entities/event.entity';
import { Ticket } from 'src/modules/tickets/entities/ticket.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, DeleteDateColumn, OneToMany } from 'typeorm';

@Entity('ticket_types')
export class TicketType {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Column()
 name: string;

 @Column({ type: 'text', nullable: true })
 description: string;

 @Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
  transformer: new ColumnNumericTransformer(),
 })
 price: number;

 @Column({ type: 'int', name: 'total_quantity' })
 totalQuantity: number;

 @Column({ type: 'int', name: 'available_quantity' })
 availableQuantity: number;

 @ManyToOne(() => Event)
 @JoinColumn({ name: 'event_id' })
 event: Event;

 @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
 tickets: Ticket[];

 @Index()
 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}