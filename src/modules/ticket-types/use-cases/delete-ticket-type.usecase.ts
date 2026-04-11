import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketTypesRepository } from '@ticket-types/repository/ticket-type.repository';

@Injectable()
export class DeleteTicketTypeUseCase {
  constructor(private readonly ticketTypesRepository: TicketTypesRepository) {}

  async execute(id: string): Promise<void> {
    const ticketType = await this.ticketTypesRepository.findById(id);

    if (!ticketType) {
      throw new NotFoundException(
        'Tipo de ingresso não encontrado para exclusão.',
      );
    }

    const ticketsSold = ticketType.totalQuantity - ticketType.availableQuantity;

    if (ticketsSold > 0) {
      throw new BadRequestException(
        `Não é possível excluir este lote pois já existem(m) ${ticketsSold} ingresso(s) vendido(s). ` +
          `Para interromper as vendas, sugerimos editar a quantidade para zero.`,
      );
    }

    const result = await this.ticketTypesRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        'Erro ao tentar processar a exclusão do lote.',
      );
    }
  }
}
