import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { ListUsersUseCase } from '../use-cases/list-users.usecase';
import { FindUserUseCase } from '../use-cases/find-user.usecase';
import { UpdateUserUseCase } from '../use-cases/update-user.usecase';
import { DeleteUserUseCase } from '../use-cases/delete-user.usecase';

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