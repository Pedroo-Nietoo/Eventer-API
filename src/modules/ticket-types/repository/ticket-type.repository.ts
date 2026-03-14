import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';
import { TicketType } from '../entities/ticket-type.entity';

@Injectable()
export class TicketTypesRepository extends BaseRepository<TicketType> {
 constructor(
  @InjectRepository(TicketType)
  private readonly ticketTypeRepo: Repository<TicketType>,
 ) {
  super(ticketTypeRepo);
 }

 async findAllWithEvent(skip: number, take: number): Promise<[TicketType[], number]> {
  return this.ticketTypeRepo.findAndCount({
   relations: {
    event: true,
   },
   skip,
   take,
   order: {
    createdAt: 'DESC',
   },
  });
 }
}