import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateTicketTokenService } from './generate-ticket-token.service';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/modules/mail/mail.service';
import { GenerateQrCodeImageService } from './generate-qrcode-image.service';
import { TicketType } from 'src/modules/ticket_type/entities/ticket_type.entity';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly secretKey: string;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly configService: ConfigService,
    private readonly generateTicketTokenService: GenerateTicketTokenService,
    private readonly generateQrCodeImageService: GenerateQrCodeImageService,
    private readonly mailService: MailService,
  ) {
    this.secretKey = this.configService.get<string>('JWT_SECRET') || "chave-secreta-padrao-para-desenvolvimento";
  }

  async create(createTicketDto: CreateTicketDto) {
    const updateResult = await this.ticketRepository.manager
      .createQueryBuilder()
      .update(TicketType)
      .set({ availableQuantity: () => "available_quantity - 1" })
      .where("id = :id AND available_quantity > 0", { id: createTicketDto.ticketTypeId })
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException('Este lote de ingressos está esgotado ou indisponível.');
    }

    const ticketId = uuidv4();
    const token = this.generateTicketTokenService.execute(
      ticketId,
      createTicketDto.eventId,
      createTicketDto.userId,
    );

    const ticket = this.ticketRepository.create({
      id: ticketId,
      qrCode: token,
      status: TicketStatus.VALID,
      user: { id: createTicketDto.userId },
      ticketType: { id: createTicketDto.ticketTypeId },
    });

    try {
      const savedTicket = await this.ticketRepository.save(ticket);

      this.dispatchTicketEmail(savedTicket.id, token).catch((err) => {
        this.logger.error(`Falha silenciosa ao enviar e-mail em background: ${err.message}`);
      });

      return savedTicket;

    } catch (error) {

      try {
        await this.ticketRepository.manager
          .createQueryBuilder()
          .update(TicketType)
          .set({ availableQuantity: () => "available_quantity + 1" })
          .where("id = :id", { id: createTicketDto.ticketTypeId })
          .execute();

        this.logger.warn(`Estoque compensado (+1) para o Lote ${createTicketDto.ticketTypeId} devido a falha na emissão.`);
      } catch (compensationError) {
        this.logger.fatal(`CRÍTICO: Falha ao compensar estoque do Lote ${createTicketDto.ticketTypeId}. O banco pode estar inconsistente!`, compensationError.stack);
      }

      if (error.code === '23503') throw new NotFoundException('A conta de usuário informada é inválida.');
      if (error.code === '23505') throw new BadRequestException('Já existe um registro com este QR Code.');

      this.logger.error(`Falha inesperada ao criar ingresso: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ocorreu um erro interno ao processar a emissão do ingresso.');
    }
  }

  //todo tentar consumir apenas uma chamada do banco de dados para validar o ingresso, evitando a chamada extra para atualizar o status
  async validateTicket(qrCode: string) {
    try {
      const payload = jwt.verify(qrCode, this.secretKey) as jwt.JwtPayload;
      const ticketId = payload.sub as string;

      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: {
          user: true,
          ticketType: true
        },
      });

      if (!ticket) {
        throw new NotFoundException('Ingresso não encontrado na base de dados.');
      }

      if (ticket.status === TicketStatus.USED) {
        throw new BadRequestException('Este ingresso já foi utilizado.');
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        throw new BadRequestException('Este ingresso está cancelado.');
      }

      ticket.status = TicketStatus.USED;
      await this.ticketRepository.save(ticket);

      return {
        success: true,
        message: 'Ingresso validado com sucesso!',
        ticketData: {
          id: ticket.id,
          ticketTypeName: ticket.ticketType.name,
        },
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('QR Code inválido, corrompido ou adulterado.');
      }
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const skip = (page - 1) * limit;

    const [tickets, total] = await this.ticketRepository.findAndCount({
      select: {
        id: true,
        qrCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
        },
        ticketType: {
          id: true,
          event: {
            id: true,
          },
        },
      },
      relations: {
        user: true,
        ticketType: {
          event: true,
        },
      },
      skip: skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: tickets,
      meta: {
        totalItems: total,
        itemCount: tickets.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      select: {
        id: true,
        qrCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          username: true,
          email: true,
        },
        ticketType: {
          id: true,
          name: true,
          price: true,
          event: {
            id: true,
            title: true,
          },
        },
      },
      relations: {
        user: true,
        ticketType: {
          event: true,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const updatePayload: any = {};

    if (updateTicketDto.userId) {
      updatePayload.user = { id: updateTicketDto.userId };
    }

    if (updateTicketDto.ticketTypeId) {
      updatePayload.ticketType = { id: updateTicketDto.ticketTypeId };
    }

    if (Object.keys(updatePayload).length === 0) {
      return this.findOne(id);
    }

    try {
      const result = await this.ticketRepository.update(id, updatePayload);

      if (result.affected === 0) {
        throw new NotFoundException('Ingresso não encontrado para atualização.');
      }

      return await this.findOne(id);

    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException('Os novos dados de referência informados (Usuário ou Tipo de Ingresso) são inválidos.');
      }

      this.logger.error(`Erro ao atualizar o ingresso ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Falha ao atualizar os dados do ingresso.');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.ticketRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Ingresso não encontrado para exclusão.');
      }

      return {
        success: true,
        message: 'Ingresso removido do sistema com sucesso.'
      };

    } catch (error) {
      this.logger.error(`Erro ao remover o ingresso ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Falha interna ao tentar remover o ingresso.');
    }
  }

  private async dispatchTicketEmail(ticketId: string, qrCodeToken: string) {
    const ticketFull = await this.ticketRepository.findOne({
      where: { id: ticketId },
      select: {
        id: true,
        user: {
          id: true,
          email: true,
          username: true
        },
        ticketType: {
          id: true,
          event: {
            id: true,
            title: true
          }
        }
      },
      relations: {
        user: true,
        ticketType: { event: true }
      }
    });

    if (!ticketFull) return;

    const qrCodeBuffer = await this.generateQrCodeImageService.execute(qrCodeToken);

    await this.mailService.sendTicketEmail(
      ticketFull.user.email,
      ticketFull.user.username,
      ticketFull.ticketType.event.title,
      qrCodeBuffer
    );
  }
}
