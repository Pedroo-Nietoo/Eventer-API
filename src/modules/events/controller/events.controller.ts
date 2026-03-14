import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';

import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

import { CreateEventUseCase } from '../use-cases/create-event.usecase';
import { FindNearbyEventsUseCase } from '../use-cases/find-nearby-events.usecase';
import { ListEventsUseCase } from '../use-cases/list-events.usecase';
import { FindEventUseCase } from '../use-cases/find-event.usecase';
import { UpdateEventUseCase } from '../use-cases/update-event.usecase';
import { DeleteEventUseCase } from '../use-cases/delete-event.usecase';
import { FindEventBySlugUseCase } from '../use-cases/find-event-by-slug.usecase';
import { SwaggerEventController as Doc } from './events.swagger';

@Doc.Main()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly findNearbyEventsUseCase: FindNearbyEventsUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly findEventUseCase: FindEventUseCase,
    private readonly findEventBySlugUseCase: FindEventBySlugUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) { }

  @Doc.Create()
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.createEventUseCase.execute(createEventDto);
  }

  @Doc.FindNearby()
  @Get('nearby')
  getNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    return this.findNearbyEventsUseCase.execute(+lat, +lng, +radius);
  }

  @Doc.FindAll()
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.listEventsUseCase.execute(paginationDto);
  }

  @Doc.FindOne()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findEventUseCase.execute(id);
  }

  @Doc.FindBySlug()
  @Get('list/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.findEventBySlugUseCase.execute(slug);
  }

  @Doc.Update()
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.updateEventUseCase.execute(id, updateEventDto);
  }

  @Doc.Delete()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteEventUseCase.execute(id);
  }
}