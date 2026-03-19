import { BadRequestException, Injectable } from '@nestjs/common';
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

 //todo verificar se é pra colocar aqui mesmo, não tá parecendo
 async decrementAvailableQuantity(id: string, quantity: number): Promise<void> {
  const result = await this.ticketTypeRepo
   .createQueryBuilder()
   .update(TicketType)
   .set({ availableQuantity: () => `available_quantity - ${quantity}` })
   .where("id = :id AND available_quantity >= :quantity", { id, quantity })
   .execute();

  if (result.affected === 0) {
   throw new BadRequestException('Ingressos insuficientes para este lote.');
  }
 }
}