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

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly secretKey: string;

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly configService: ConfigService,
    private readonly generateTicketTokenService: GenerateTicketTokenService,
  ) {
    this.secretKey = this.configService.get<string>('JWT_SECRET') || "chave-secreta-padrao-para-desenvolvimento";
  }

  async create(createTicketDto: CreateTicketDto) {
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
      return await this.ticketRepository.save(ticket);

    } catch (error) {
      if (error.code === '23503') {
        const detail = error.detail || '';

        if (detail.includes('ticket_type_id')) {
          throw new NotFoundException('O tipo de ingresso selecionado não está disponível ou não existe.');
        }

        if (detail.includes('user_id')) {
          throw new NotFoundException('A conta de usuário informada não foi encontrada.');
        }

        throw new BadRequestException('Os dados de referência enviados são inválidos.');
      }

      if (error.code === '23505') {
        throw new BadRequestException('Já existe um registro com este QR Code ou ID.');
      }

      this.logger.error(`Falha inesperada ao criar ingresso: ${error.message}`, error.stack);

      throw new InternalServerErrorException('Ocorreu um erro interno ao processar a emissão do ingresso. Tente novamente.');
    }
  }

  //todo tentar consumir apenas uma chamada do banco de dados para validar o ingresso, evitando a chamada extra para atualizar o status
  async validateTicket(qrCode: string) {
    try {
      const payload = jwt.verify(qrCode, this.secretKey) as jwt.JwtPayload;
      const ticketId = payload.sub as string;

      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['user', 'ticketType'],
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
          type: ticket.ticketType.name,
          // Evite retornar dados sensíveis do usuário aqui
        },
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('QR Code inválido, corrompido ou adulterado.');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all tickets`;
  }

  findOne(id) {
    return `This action returns a #${id} ticket`;
  }

  update(id, updateTicketDto: UpdateTicketDto) {
    return `This action updates a #${id} ticket`;
  }

  remove(id) {
    return `This action removes a #${id} ticket`;
  }
}
