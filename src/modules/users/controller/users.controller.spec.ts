import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

import { ListUsersUseCase } from '@users/use-cases/list-users.usecase';
import { FindUserUseCase } from '@users/use-cases/find-user.usecase';
import { UpdateUserUseCase } from '@users/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '@users/use-cases/delete-user.usecase';
import { CreateUserUseCase } from '@users/use-cases/create-user.usecase';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: {},
        },
        {
          provide: ListUsersUseCase,
          useValue: {},
        },
        {
          provide: FindUserUseCase,
          useValue: {},
        },
        {
          provide: UpdateUserUseCase,
          useValue: {},
        },
        {
          provide: DeleteUserUseCase,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});