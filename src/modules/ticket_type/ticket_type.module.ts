import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketTypeService } from './ticket_type.service';
import { TicketTypeController } from './ticket_type.controller';
import { TicketType } from './entities/ticket_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketType])],
  controllers: [TicketTypeController],
  providers: [TicketTypeService],
  exports: [TicketTypeService]
})
export class TicketTypeModule { }