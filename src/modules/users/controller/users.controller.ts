import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '@common/dtos/pagination.dto';
import { Public } from '@common/decorators/public.decorator';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { CreateUserUseCase } from '@users/use-cases/create-user.usecase';
import { FindUserUseCase } from '@users/use-cases/find-user.usecase';
import { UpdateUserUseCase } from '@users/use-cases/update-user.usecase';
import { ListUsersUseCase } from '@users/use-cases/list-users.usecase';
import { DeleteUserUseCase } from '@users/use-cases/delete-user.usecase';
import { SwaggerUserController as Doc } from './users.swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/role.enum';
import { RolesGuard } from '@common/guards/roles.guard';

@Doc.Main()
@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) { }

  @Doc.Create()
  @Public()
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Doc.FindAll()
  @Roles({ deny: [UserRole.USER, UserRole.EVENT_CREATOR] })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.listUsersUseCase.execute(paginationDto);
  }

  @Doc.FindOne()
  @Roles({ allow: [UserRole.ADMIN] })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.findUserUseCase.execute(id);
  }

  @Doc.Update()
  @Patch(':id')
  @Roles({ allow: [UserRole.ADMIN] })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Doc.Delete()
  @Roles({ allow: [UserRole.ADMIN] })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}
