import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventTicketTypesService } from './event-ticket-types.service';
import { CreateEventTicketTypeDto } from './dto/create-event-ticket-type.dto';
import { UpdateEventTicketTypeDto } from './dto/update-event-ticket-type.dto';

@Controller('event-ticket-types')
export class EventTicketTypesController {
  constructor(
    private readonly eventTicketTypesService: EventTicketTypesService,
  ) {}

  @Post()
  create(@Body() createEventTicketTypeDto: CreateEventTicketTypeDto) {
    return this.eventTicketTypesService.create(createEventTicketTypeDto);
  }

  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.eventTicketTypesService.findAll(page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventTicketTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventTicketTypeDto: UpdateEventTicketTypeDto,
  ) {
    return this.eventTicketTypesService.update(id, updateEventTicketTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventTicketTypesService.remove(id);
  }
}
