import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { FindTicketUseCase } from './find-ticket.usecase';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { TicketType } from 'src/modules/ticket-types/entities/ticket-type.entity';
import { TicketResponseDto } from '../dto/ticket-response.dto';

@Injectable()
export class UpdateTicketUseCase {
  private readonly logger = new Logger(UpdateTicketUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly findTicketUseCase: FindTicketUseCase,
  ) { }

  async execute(id: string, dto: UpdateTicketDto): Promise<TicketResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticket = await queryRunner.manager.findOne(Ticket, {
        where: { id },
        relations: ['ticketType'],
      });

      if (!ticket) {
        throw new NotFoundException('Ingresso não encontrado para atualização.');
      }

      if (dto.status === TicketStatus.CANCELLED && ticket.status !== TicketStatus.CANCELLED) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(TicketType)
          .set({ availableQuantity: () => 'available_quantity + 1' })
          .where('id = :id', { id: ticket.ticketType.id })
          .execute();
      }

      if (ticket.status === TicketStatus.CANCELLED && dto.status === TicketStatus.VALID) {
        const updateResult = await queryRunner.manager
          .createQueryBuilder()
          .update(TicketType)
          .set({ availableQuantity: () => 'available_quantity - 1' })
          .where('id = :id AND available_quantity > 0', { id: ticket.ticketType.id })
          .execute();

        if (updateResult.affected === 0) {
          throw new BadRequestException('Não há estoque disponível para reativar este ingresso.');
        }
      }

      if (dto.ticketTypeId && dto.ticketTypeId !== ticket.ticketType.id) {
        if (ticket.status !== TicketStatus.CANCELLED) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(TicketType)
            .set({ availableQuantity: () => 'available_quantity + 1' })
            .where('id = :id', { id: ticket.ticketType.id })
            .execute();
        }

        const newTicketType = await queryRunner.manager.findOne(TicketType, {
          where: { id: dto.ticketTypeId },
        });

        if (!newTicketType) {
          throw new NotFoundException('O novo tipo de ingresso informado não existe.');
        }

        const targetStatus = dto.status || ticket.status;
        if (targetStatus !== TicketStatus.CANCELLED) {
          const updateResult = await queryRunner.manager
            .createQueryBuilder()
            .update(TicketType)
            .set({ availableQuantity: () => 'available_quantity - 1' })
            .where('id = :id AND available_quantity > 0', { id: dto.ticketTypeId })
            .execute();

          if (updateResult.affected === 0) {
            throw new BadRequestException('O novo lote selecionado não possui estoque disponível.');
          }
        }

        ticket.ticketType = { id: dto.ticketTypeId } as any;
        ticket.purchasePrice = newTicketType.price;
      }

      if (dto.status) ticket.status = dto.status;
      if (dto.userId) ticket.user = { id: dto.userId } as any;

      await queryRunner.manager.save(ticket);
      await queryRunner.commitTransaction();

      return await this.findTicketUseCase.execute(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Erro ao atualizar o ingresso ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Falha ao atualizar os dados do ingresso.');
    } finally {
      await queryRunner.release();
    }
  }
}