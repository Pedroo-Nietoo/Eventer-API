import { Event } from 'src/modules/events/entities/event.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

@Entity('ticket_types')
export class TicketType {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Column()
 name: string; // Ex: VIP, Comum, Pista 1

 @Column({ type: 'text', nullable: true })
 description: string;

 @Column({ type: 'decimal', precision: 10, scale: 2 })
 price: number;

 @Column({ type: 'int', name: 'total_quantity' })
 totalQuantity: number;

 @Column({ type: 'int', name: 'available_quantity' })
 availableQuantity: number;

 @ManyToOne(() => Event)
 @JoinColumn({ name: 'event_id' })
 event: Event;

 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;
}