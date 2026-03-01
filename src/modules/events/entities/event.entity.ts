import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import type { Point } from 'geojson';

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

 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}