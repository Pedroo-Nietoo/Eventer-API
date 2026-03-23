import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus, Req
} from '@nestjs/common';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Doc.Main()
@UseGuards(RolesGuard)
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
  @Roles({ deny: [UserRole.USER] })
  @Post()
  create(@Body() createEventDto: CreateEventDto, @CurrentUser('id') userId: string) {
    return this.createEventUseCase.execute(createEventDto, userId);
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
  @Roles({ deny: [UserRole.USER] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.updateEventUseCase.execute(
      id,
      updateEventDto,
      user.id,
      user.role
    );
  }

  @Doc.Delete()
  @Roles({ deny: [UserRole.USER] })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.deleteEventUseCase.execute(id, user.id, user.role);
  }
}