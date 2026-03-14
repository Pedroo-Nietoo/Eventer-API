import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { Ticket } from '../entities/ticket.entity';

@Injectable()
export class TicketsRepository extends BaseRepository<Ticket> {
 constructor(
  @InjectRepository(Ticket)
  private readonly ticketsRepo: Repository<Ticket>,
 ) {
  super(ticketsRepo);
 }

 async findByIdWithRelations(id: string): Promise<Ticket | null> {
  return this.ticketsRepo.findOne({
   where: { id },
   relations: {
    user: true,
    ticketType: {
     event: true,
    },
   },
  });
 }

 async findAllWithRelations(skip: number, take: number): Promise<[Ticket[], number]> {
  return this.ticketsRepo.findAndCount({
   relations: {
    user: true,
    ticketType: {
     event: true,
    },
   },
   skip,
   take,
   order: {
    createdAt: 'DESC',
   },
  });
 }
}