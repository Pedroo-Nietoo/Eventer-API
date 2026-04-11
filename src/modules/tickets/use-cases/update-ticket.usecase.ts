import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateTicketDto } from '@tickets/dto/update-ticket.dto';
import { Ticket, TicketStatus } from '@tickets/entities/ticket.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { User } from '@users/entities/user.entity';
import { TicketResponseDto } from '@tickets/dto/ticket-response.dto';

@Injectable()
export class UpdateTicketUseCase {
  private readonly logger = new Logger(UpdateTicketUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(
    id: string,
    dto: UpdateTicketDto,
    userId: string,
  ): Promise<TicketResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticket = await queryRunner.manager.findOne(Ticket, {
        where: { id },
        relations: ['ticketType', 'ticketType.event'],
      });

      if (!ticket) {
        throw new NotFoundException(
          'Ingresso não encontrado para atualização.',
        );
      }

      if (
        dto.status === TicketStatus.CANCELLED &&
        ticket.status !== TicketStatus.CANCELLED
      ) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(TicketType)
          .set({ availableQuantity: () => 'available_quantity + 1' })
          .where('id = :id', { id: ticket.ticketType.id })
          .execute();
      }

      if (
        ticket.status === TicketStatus.CANCELLED &&
        dto.status === TicketStatus.VALID
      ) {
        const updateResult = await queryRunner.manager
          .createQueryBuilder()
          .update(TicketType)
          .set({ availableQuantity: () => 'available_quantity - 1' })
          .where('id = :id AND available_quantity > 0', {
            id: ticket.ticketType.id,
          })
          .execute();

        if (updateResult.affected === 0) {
          throw new BadRequestException(
            'Não há estoque disponível para reativar este ingresso.',
          );
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
          relations: ['event'],
        });

        if (!newTicketType) {
          throw new NotFoundException(
            'O novo tipo de ingresso informado não existe.',
          );
        }

        if (newTicketType.event.id !== ticket.ticketType.event.id) {
          throw new BadRequestException(
            'Não é possível transferir um ingresso para um evento diferente.',
          );
        }

        const targetStatus = dto.status || ticket.status;

        if (targetStatus !== TicketStatus.CANCELLED) {
          const updateResult = await queryRunner.manager
            .createQueryBuilder()
            .update(TicketType)
            .set({ availableQuantity: () => 'available_quantity - 1' })
            .where('id = :id AND available_quantity > 0', {
              id: dto.ticketTypeId,
            })
            .execute();

          if (updateResult.affected === 0) {
            throw new BadRequestException(
              'O novo lote selecionado não possui estoque disponível.',
            );
          }
        }

        ticket.ticketType = { id: dto.ticketTypeId } as TicketType;
        ticket.purchasePrice = newTicketType.price;
      }

      if (dto.status) ticket.status = dto.status;
      if (userId) ticket.user = { id: userId } as User;

      await queryRunner.manager.save(ticket);

      const updatedTicket = await queryRunner.manager.findOne(Ticket, {
        where: { id },
        relations: { user: true, ticketType: { event: true } },
      });

      if (!updatedTicket) {
        throw new NotFoundException(
          'Ingresso não encontrado após atualização.',
        );
      }

      await queryRunner.commitTransaction();

      return TicketMapper.toResponse(updatedTicket);
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const stack = error instanceof Error ? error.stack : 'Sem stack trace';

      this.logger.error(
        `Erro ao atualizar o ingresso ${id}: ${message}`,
        stack,
      );
      throw new InternalServerErrorException(
        'Falha ao atualizar os dados do ingresso.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
