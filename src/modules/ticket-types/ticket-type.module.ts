import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { ListTicketTypesUseCase } from './use-cases/list-ticket-types.usecase';
import { FindTicketTypeUseCase } from './use-cases/find-ticket-type.usecase';
import { UpdateTicketTypeUseCase } from './use-cases/update-ticket-type.usecase';
import { DeleteTicketTypeUseCase } from './use-cases/delete-ticket-type.usecase';
import { TicketTypesController } from './controller/ticket-types.controller';
import { TicketTypesRepository } from './repository/ticket-type.repository';
import { CreateTicketTypeUseCase } from './use-cases/create-ticket-type.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType])],
  controllers: [TicketTypesController],
  providers: [
    TicketTypesRepository,
    CreateTicketTypeUseCase,
    ListTicketTypesUseCase,
    FindTicketTypeUseCase,
    UpdateTicketTypeUseCase,
    DeleteTicketTypeUseCase,
  ],
  exports: [TicketTypesRepository],
})
export class TicketTypeModule { }