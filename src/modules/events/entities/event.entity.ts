import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import type { Point } from 'geojson';
import { TicketType } from 'src/modules/ticket-types/entities/ticket-type.entity';

@Entity('events')
export class Event {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Column({ unique: true })
 slug?: string;

 @Column()
 title: string;

 @Column({ type: 'text', nullable: true })
 description: string;

 @Column({ nullable: true })
 coverImageUrl: string;

 @Index({ spatial: true })
 @Column({
  type: 'geography',
  spatialFeatureType: 'Point',
  srid: 4326,
 })
 location: Point;

 @OneToMany(() => TicketType, (ticketType) => ticketType.event)
 ticketTypes: TicketType[];

 @Index()
 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}