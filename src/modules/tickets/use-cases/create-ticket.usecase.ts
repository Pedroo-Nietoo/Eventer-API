import {
 BadRequestException,
 Injectable,
 InternalServerErrorException,
 Logger,
 NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { CreateTicketDto } from '../dto/create-ticket.dto';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { TicketType } from 'src/modules/ticket-types/entities/ticket-type.entity';
import { GenerateTicketTokenService } from '../../../core/services/generate-ticket-token.service';
import { GenerateQrCodeImageService } from '../../../core/services/generate-qrcode-image.service';
import { MailService } from 'src/core/services/mail/mail.service';
import { TicketMapper } from '../mappers/ticket.mapper';
import { TicketResponseDto } from '../dto/ticket-response.dto';

@Injectable()
export class CreateTicketUseCase {
 private readonly logger = new Logger(CreateTicketUseCase.name);

 constructor(
  private readonly dataSource: DataSource,
  private readonly generateTicketTokenService: GenerateTicketTokenService,
  private readonly generateQrCodeImageService: GenerateQrCodeImageService,
  private readonly mailService: MailService,
 ) { }

 async execute(dto: CreateTicketDto): Promise<TicketResponseDto> {
  const ticketId = uuidv4();
  const token = this.generateTicketTokenService.execute(ticketId, dto.eventId, dto.userId);

  let savedTicket: Ticket;

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
   const ticketType = await queryRunner.manager.findOne(TicketType, {
    where: { id: dto.ticketTypeId },
    select: ['id', 'price'],
   });

   if (!ticketType) {
    throw new NotFoundException('O lote de ingressos informado não existe.');
   }

   const updateResult = await queryRunner.manager
    .createQueryBuilder()
    .update(TicketType)
    .set({ availableQuantity: () => 'available_quantity - 1' })
    .where('id = :id AND available_quantity > 0', { id: dto.ticketTypeId })
    .execute();

   if (updateResult.affected === 0) {
    throw new BadRequestException('Este lote de ingressos está esgotado ou indisponível.');
   }

   const ticket = queryRunner.manager.create(Ticket, {
    id: ticketId,
    qrCode: token,
    status: TicketStatus.VALID,
    purchasePrice: ticketType.price,
    user: { id: dto.userId },
    ticketType: { id: dto.ticketTypeId },
   });

   savedTicket = await queryRunner.manager.save(ticket);

   await queryRunner.commitTransaction();
  } catch (error) {
   await queryRunner.rollbackTransaction();

   if (error instanceof BadRequestException) throw error;
   if (error instanceof NotFoundException) throw error;
   if (error.code === '23503') throw new NotFoundException('A conta de usuário informada é inválida.');
   if (error.code === '23505') throw new BadRequestException('Já existe um registro com este QR Code.');

   this.logger.error(`Falha inesperada ao criar ingresso: ${error.message}`, error.stack);
   throw new InternalServerErrorException('Ocorreu um erro interno ao processar a emissão do ingresso.');
  } finally {
   await queryRunner.release();
  }

  this.dispatchTicketEmail(savedTicket.id, token).catch((err) => {
   this.logger.error(`Falha silenciosa ao enviar e-mail em background: ${err.message}`);
  });

  return TicketMapper.toResponse(savedTicket);
 }

 //todo passar pro mail module
 private async dispatchTicketEmail(ticketId: string, qrCodeToken: string): Promise<void> {
  const ticketFull = await this.dataSource.getRepository(Ticket).findOne({
   where: { id: ticketId },
   relations: { user: true, ticketType: { event: true } },
  });

  if (!ticketFull) return;

  const qrCodeBuffer = await this.generateQrCodeImageService.execute(qrCodeToken);

  await this.mailService.sendTicketEmail(
   ticketFull.user.email,
   ticketFull.user.username,
   ticketFull.ticketType.event.title,
   qrCodeBuffer,
  );
 }
}