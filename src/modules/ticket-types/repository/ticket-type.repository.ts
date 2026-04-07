import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '@common/repository/base.repository';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';

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

  async decrementStock(id: string, quantity: number, manager: EntityManager): Promise<void> {
    const result = await manager.getRepository(TicketType)
      .createQueryBuilder()
      .update(TicketType)
      .set({ availableQuantity: () => `available_quantity - ${quantity}` })
      .where("id = :id AND available_quantity >= :quantity", { id, quantity })
      .execute();

    if (result.affected === 0) {
      throw new BadRequestException('Ingressos insuficientes para este lote.');
    }
  }

  async incrementStock(id: string, quantity: number, manager: EntityManager): Promise<void> {
    await manager.getRepository(TicketType)
      .createQueryBuilder()
      .update(TicketType)
      .set({ availableQuantity: () => `available_quantity + ${quantity}` })
      .where("id = :id", { id })
      .execute();
  }
}