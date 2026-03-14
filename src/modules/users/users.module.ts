import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controller/users.controller';
import { UsersRepository } from './repository/users.repository';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { FindUserUseCase } from './use-cases/find-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { DeleteUserUseCase } from './use-cases/delete-user.usecase';
import { ListUsersUseCase } from './use-cases/list-users.usecase';
import { FindUserByEmailUseCase } from './use-cases/find-user-by-email.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    CreateUserUseCase,
    ListUsersUseCase,
    FindUserUseCase,
    FindUserByEmailUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [
    UsersRepository,
    FindUserByEmailUseCase,
  ],
})
export class UsersModule { }