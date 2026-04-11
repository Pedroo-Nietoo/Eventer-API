import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateTicketDto } from '@tickets/dto/create-ticket.dto';
import { Ticket, TicketStatus } from '@tickets/entities/ticket.entity';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { TicketMapper } from '@tickets/mappers/ticket.mapper';
import { TicketResponseDto } from '@tickets/dto/ticket-response.dto';
import { DispatchTicketEmailUseCase } from './dispatch-ticket-email.usecase';
import { GenerateTicketTokenService } from '@services/generate-ticket-token.service';
import { DatabaseError } from '@common/interfaces/database-error.interface';

@Injectable()
export class CreateTicketUseCase {
  private readonly logger = new Logger(CreateTicketUseCase.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly generateTicketTokenService: GenerateTicketTokenService,
    private readonly dispatchTicketEmailUseCase: DispatchTicketEmailUseCase,
  ) {}

  async execute(
    dto: CreateTicketDto,
    userId: string,
  ): Promise<TicketResponseDto> {
    let savedTicket: Ticket;
    let token: string;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ticketType = await queryRunner.manager.findOne(TicketType, {
        where: { id: dto.ticketTypeId },
        relations: { event: true },
        select: {
          id: true,
          price: true,
          event: { id: true },
        },
      });

      if (!ticketType) {
        throw new NotFoundException(
          'O lote de ingressos informado não existe.',
        );
      }

      if (dto.eventId !== ticketType.event.id) {
        throw new BadRequestException(
          'O evento informado não corresponde ao lote de ingressos selecionado.',
        );
      }

      const generated = this.generateTicketTokenService.execute();
      const ticketId = generated.ticketId;
      token = generated.token;

      const ticket = queryRunner.manager.create(Ticket, {
        id: ticketId,
        qrCode: token,
        status: TicketStatus.VALID,
        purchasePrice: ticketType.price,
        user: { id: userId },
        ticketType: { id: dto.ticketTypeId },
      });

      savedTicket = await queryRunner.manager.save(ticket);

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const dbError = error as DatabaseError;

      if (dbError.code === '23503') {
        throw new NotFoundException('A conta de usuário informada é inválida.');
      }

      if (dbError.code === '23505') {
        throw new BadRequestException(
          'Já existe um registro com este QR Code.',
        );
      }

      this.logger.error(
        `Falha inesperada ao criar ingresso: ${dbError.message}`,
        dbError.stack,
      );

      throw new InternalServerErrorException(
        'Ocorreu um erro interno ao processar a emissão do ingresso.',
      );
    } finally {
      await queryRunner.release();
    }

    this.dispatchTicketEmailUseCase
      .execute(savedTicket.id, token)
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Erro desconhecido';
        this.logger.error(`Erro no processamento do e-mail: ${message}`);
      });

    return TicketMapper.toResponse(savedTicket);
  }
}
