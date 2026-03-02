import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketTypeDto } from './dto/create-ticket_type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket_type.dto';
import { TicketType } from './entities/ticket_type.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class TicketTypeService {
  private readonly logger = new Logger(TicketTypeService.name);

  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) { }

  async create(createTicketTypeDto: CreateTicketTypeDto) {
    const ticketType = this.ticketTypeRepository.create({
      ...createTicketTypeDto,
      availableQuantity: createTicketTypeDto.totalQuantity,
      event: { id: createTicketTypeDto.eventId },
    });

    try {
      return await this.ticketTypeRepository.save(ticketType);

    } catch (error) {
      if (error.code === '23503') {
        throw new NotFoundException('O evento informado não existe na base de dados.');
      }

      this.logger.error(`Erro ao criar tipo de ingresso: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ocorreu um erro interno ao criar o lote de ingressos.');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;

    const skip = (page - 1) * limit;

    const [ticketTypes, total] = await this.ticketTypeRepository.findAndCount({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        totalQuantity: true,
        availableQuantity: true,
        createdAt: true,
        updatedAt: true,
        event: {
          id: true,
        },
      },
      relations: {
        event: true,
      },
      skip: skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: ticketTypes,
      meta: {
        totalItems: total,
        itemCount: ticketTypes.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: string) {
    const ticketType = await this.ticketTypeRepository.findOne({ where: { id } });

    if (!ticketType) {
      throw new NotFoundException(`Tipo de ingresso não encontrado.`);
    }

    return ticketType;
  }

  async update(id: string, updateTicketTypeDto: UpdateTicketTypeDto) {
    const result = await this.ticketTypeRepository.update(id, updateTicketTypeDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Tipo de ingresso não encontrado para atualização.`);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.ticketTypeRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Tipo de ingresso não encontrado para exclusão.`);
    }
  }
}