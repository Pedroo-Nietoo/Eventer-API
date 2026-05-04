import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { CreateTicketTypeDto } from '@ticket-types/dto/create-ticket-type.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { DatabaseError } from '@common/interfaces/database-error.interface';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class CreateTicketTypeUseCase {
  private readonly logger = new Logger(CreateTicketTypeUseCase.name);

  constructor(
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto: CreateTicketTypeDto): Promise<TicketTypeResponseDto> {
    const ticketType = this.ticketTypesRepository.create({
      ...dto,
      availableQuantity: dto.totalQuantity,
      event: { id: dto.eventId },
    });

    try {
      const saved = await this.ticketTypesRepository.save(ticketType);

      await this.cacheService.delByPattern('ticket-types:list:*');

      return TicketTypeMapper.toResponse(saved);
    } catch (error: unknown) {
      const dbError = error as DatabaseError;

      if (dbError.code === '23503') {
        throw new NotFoundException(
          'O evento informado não existe na base de dados.',
        );
      }

      const message = dbError.message || 'Erro desconhecido';
      const stack = dbError.stack || 'Sem stack trace';

      this.logger.error(`Erro ao criar tipo de ingresso: ${message}`, stack);

      throw new InternalServerErrorException(
        'Ocorreu um erro interno ao criar o lote de ingressos.',
      );
    }
  }
}
