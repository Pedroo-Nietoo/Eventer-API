import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CreateTicketDto } from '@tickets/dto/create-ticket.dto';
import { UpdateTicketDto } from '@tickets/dto/update-ticket.dto';
import { ValidateTicketDto } from '@tickets/dto/validate-ticket.dto';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { CreateTicketUseCase } from '@tickets/use-cases/create-ticket.usecase';
import { ValidateTicketUseCase } from '@tickets/use-cases/validate-ticket.usecase';
import { ListTicketsUseCase } from '@tickets/use-cases/list-tickets.usecase';
import { FindTicketUseCase } from '@tickets/use-cases/find-ticket.usecase';
import { UpdateTicketUseCase } from '@tickets/use-cases/update-ticket.usecase';
import { DeleteTicketUseCase } from '@tickets/use-cases/delete-ticket.usecase';
import { SwaggerTicketController as Doc } from './tickets.swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Doc.Main()
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
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser('id') loggedUserId: string) {
    return this.createTicketUseCase.execute(createTicketDto, loggedUserId);
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
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser('id') userId: string
  ) {
    return this.updateTicketUseCase.execute(id, updateTicketDto, userId);
  }

  @Doc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteTicketUseCase.execute(id);
  }
}