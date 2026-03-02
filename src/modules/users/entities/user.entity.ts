import { UserRole } from 'src/common/enums/role.enum';
import { Ticket } from 'src/modules/tickets/entities/ticket.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';


@Entity('users')
@Index('IDX_UNIQUE_EMAIL_ACTIVE', ['email'], { unique: true, where: 'deleted_at IS NULL' })
export class User {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Column()
 username: string;

 @Column()
 email: string;

 @Column()
 password: string;

 @Column({ nullable: true })
 profilePicture: string;

 @Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.USER,
 })
 role: UserRole;

 @OneToMany(() => Ticket, (ticket) => ticket.user)
 tickets: Ticket[];

 @CreateDateColumn({ name: 'created_at' })
 createdAt: Date;

 @UpdateDateColumn({ name: 'updated_at' })
 updatedAt: Date;

 @DeleteDateColumn({ name: 'deleted_at' })
 deletedAt: Date;
}