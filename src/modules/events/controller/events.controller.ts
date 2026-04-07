import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus
} from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/role.enum';
import { SwaggerEventController as Doc } from './events.swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/decorators/current-user.decorator';
import { CreateEventUseCase } from '@events/use-cases/create-event.usecase';
import { FindNearbyEventsUseCase } from '@events/use-cases/find-nearby-events.usecase';
import { ListEventsUseCase } from '@events/use-cases/list-events.usecase';
import { FindEventUseCase } from '@events/use-cases/find-event.usecase';
import { FindEventBySlugUseCase } from '@events/use-cases/find-event-by-slug.usecase';
import { UpdateEventUseCase } from '@events/use-cases/update-event.usecase';
import { DeleteEventUseCase } from '@events/use-cases/delete-event.usecase';
import { CreateEventDto } from '@events/dto/create-event.dto';
import { UpdateEventDto } from '@events/dto/update-event.dto';

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