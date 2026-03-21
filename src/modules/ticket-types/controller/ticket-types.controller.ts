import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateTicketTypeUseCase } from '../use-cases/create-ticket-type.usecase';
import { ListTicketTypesUseCase } from '../use-cases/list-ticket-types.usecase';
import { FindTicketTypeUseCase } from '../use-cases/find-ticket-type.usecase';
import { UpdateTicketTypeUseCase } from '../use-cases/update-ticket-type.usecase';
import { DeleteTicketTypeUseCase } from '../use-cases/delete-ticket-type.usecase';
import { CreateTicketTypeDto } from '../dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from '../dto/update-ticket-type.dto';
import { SwaggerTicketTypeController as Doc } from './ticket-types.swagger';

@Doc.Main()
@Controller('ticket-types')
export class TicketTypesController {
  constructor(
    private readonly createTicketTypeUseCase: CreateTicketTypeUseCase,
    private readonly listTicketTypesUseCase: ListTicketTypesUseCase,
    private readonly findTicketTypeUseCase: FindTicketTypeUseCase,
    private readonly updateTicketTypeUseCase: UpdateTicketTypeUseCase,
    private readonly deleteTicketTypeUseCase: DeleteTicketTypeUseCase,
  ) { }

  @Doc.Create()
  @Post()
  create(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.createTicketTypeUseCase.execute(createTicketTypeDto);
  }

  @Doc.FindAll()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.listTicketTypesUseCase.execute(paginationDto);
  }

  @Doc.FindOne()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findTicketTypeUseCase.execute(id);
  }

  @Doc.Update()
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTicketTypeDto: UpdateTicketTypeDto) {
    return this.updateTicketTypeUseCase.execute(id, updateTicketTypeDto);
  }

  @Doc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteTicketTypeUseCase.execute(id);
  }
}