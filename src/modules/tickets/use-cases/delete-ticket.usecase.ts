import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ticket, TicketStatus } from '@tickets/entities/ticket.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';

@Injectable()
export class DeleteTicketUseCase {
  private readonly logger = new Logger(DeleteTicketUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string): Promise<void> {
    const ticketRepo = this.dataSource.getRepository(Ticket);

    const ticket = await ticketRepo.findOne({
      where: { id },
      relations: ['ticketType'],
    });

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado para exclusão.');
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Este ingresso já encontra-se cancelado.');
    }

    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException(
        'Não é possível cancelar ou excluir um ingresso que já foi utilizado.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(TicketType)
        .set({ availableQuantity: () => 'available_quantity + 1' })
        .where('id = :id', { id: ticket.ticketType.id })
        .execute();

      await queryRunner.manager.update(
        Ticket,
        { id },
        {
          status: TicketStatus.CANCELLED,
        },
      );

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      const errorStack =
        error instanceof Error ? error.stack : 'Sem stack trace';

      this.logger.error(
        `Erro ao remover o ingresso ${id}: ${errorMessage}`,
        errorStack,
      );

      throw new InternalServerErrorException(
        'Falha interna ao tentar cancelar e remover o ingresso.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
