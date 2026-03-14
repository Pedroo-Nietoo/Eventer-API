import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateTicketUseCase } from '../use-cases/create-ticket.usecase';
import { ValidateTicketUseCase } from '../use-cases/validate-ticket.usecase';
import { ListTicketsUseCase } from '../use-cases/list-tickets.usecase';
import { FindTicketUseCase } from '../use-cases/find-ticket.usecase';
import { UpdateTicketUseCase } from '../use-cases/update-ticket.usecase';
import { DeleteTicketUseCase } from '../use-cases/delete-ticket.usecase';
import { SwaggerTicketController as Doc } from './tickets.swagger';

@Doc.Main()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly validateTicketUseCase: ValidateTicketUseCase,
    private readonly listTicketsUseCase: ListTicketsUseCase,
    private readonly findTicketUseCase: FindTicketUseCase,
    private readonly updateTicketUseCase: UpdateTicketUseCase,
    private readonly deleteTicketUseCase: DeleteTicketUseCase,
  ) { }

  @Doc.Create()
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.createTicketUseCase.execute(createTicketDto);
  }

  @Doc.Validate()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() validateTicketDto: ValidateTicketDto) {
    return this.validateTicketUseCase.execute(validateTicketDto.qrCode);
  }

  @Doc.FindAll()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.listTicketsUseCase.execute(paginationDto);
  }

  @Doc.FindOne()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findTicketUseCase.execute(id);
  }

  @Doc.Update()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto
  ) {
    return this.updateTicketUseCase.execute(id, updateTicketDto);
  }

  @Doc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteTicketUseCase.execute(id);
  }
}