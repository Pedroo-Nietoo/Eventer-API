import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketTypeResponseDto } from '@ticket-types/dto/ticket-type-response.dto';
import { UpdateTicketTypeDto } from '@ticket-types/dto/update-ticket-type.dto';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';
import { TicketTypeMapper } from '@ticket-types/mappers/ticket-type.mapper';
import { TicketType } from '@ticket-types/entities/ticket-type.entity';
import { CacheService } from '@infra/redis/services/cache.service';

@Injectable()
export class UpdateTicketTypeUseCase {
  constructor(
    private readonly ticketTypesRepository: TicketTypesRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    dto: UpdateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    const response = await this.ticketTypesRepository.manager.transaction(
      async (manager) => {
        const ticketType = await manager.findOne(TicketType, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!ticketType) {
          throw new NotFoundException('Tipo de ingresso não encontrado.');
        }

        if (
          dto.totalQuantity !== undefined &&
          dto.totalQuantity !== ticketType.totalQuantity
        ) {
          const ticketsSold =
            ticketType.totalQuantity - ticketType.availableQuantity;

          if (dto.totalQuantity < ticketsSold) {
            throw new BadRequestException(
              `A nova quantidade total não pode ser menor do que o número de ingressos já vendidos (${ticketsSold}).`,
            );
          }

          const difference = dto.totalQuantity - ticketType.totalQuantity;
          ticketType.availableQuantity += difference;
          ticketType.totalQuantity = dto.totalQuantity;
        }

        const updateData = { ...dto };
        delete updateData.totalQuantity;

        Object.assign(ticketType, updateData);

        const updatedEntity = await manager.save(ticketType);
        return TicketTypeMapper.toResponse(updatedEntity);
      },
    );

    await Promise.all([
      this.cacheService.del(`ticket-types:id:${id}`),
      this.cacheService.delByPattern('ticket-types:list:*'),
    ]);

    return response;
  }
}
