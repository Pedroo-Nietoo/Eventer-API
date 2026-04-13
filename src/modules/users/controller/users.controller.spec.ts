import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '@users/use-cases/create-user.usecase';
import { ListUsersUseCase } from '@users/use-cases/list-users.usecase';
import { FindUserUseCase } from '@users/use-cases/find-user.usecase';
import { UpdateUserUseCase } from '@users/use-cases/update-user.usecase';
import { DeleteUserUseCase } from '@users/use-cases/delete-user.usecase';

describe('UsersController', () => {
  let controller: UsersController;
  let createUserUseCase: CreateUserUseCase;
  let listUsersUseCase: ListUsersUseCase;
  let findUserUseCase: FindUserUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;

  const mockCreateUserUseCase = { execute: jest.fn() };
  const mockListUsersUseCase = { execute: jest.fn() };
  const mockFindUserUseCase = { execute: jest.fn() };
  const mockUpdateUserUseCase = { execute: jest.fn() };
  const mockDeleteUserUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: CreateUserUseCase, useValue: mockCreateUserUseCase },
        { provide: ListUsersUseCase, useValue: mockListUsersUseCase },
        { provide: FindUserUseCase, useValue: mockFindUserUseCase },
        { provide: UpdateUserUseCase, useValue: mockUpdateUserUseCase },
        { provide: DeleteUserUseCase, useValue: mockDeleteUserUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    listUsersUseCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    findUserUseCase = module.get<FindUserUseCase>(FindUserUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar CreateUserUseCase.execute com o DTO correto', async () => {
      const dto: any = { username: 'testuser', email: 'test@email.com', password: '123' };
      const expectedResult: any = { id: 'uuid-1', username: 'testuser', email: 'test@email.com' };

      mockCreateUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(createUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('deve chamar ListUsersUseCase.execute com a paginação correta', async () => {
      const paginationDto: any = { page: 1, limit: 10 };
      const expectedResult: any = { data: [], meta: { total: 0, page: 1 } };

      mockListUsersUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);

      expect(listUsersUseCase.execute).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('deve chamar FindUserUseCase.execute com o ID correto', async () => {
      const id = 'uuid-123';
      const expectedResult: any = { id, username: 'testuser' };

      mockFindUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(findUserUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('deve chamar UpdateUserUseCase.execute com o ID e DTO corretos', async () => {
      const id = 'uuid-123';
      const dto: any = { username: 'updateduser' };
      const expectedResult: any = { id, username: 'updateduser' };

      mockUpdateUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(updateUserUseCase.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('deve chamar DeleteUserUseCase.execute com o ID correto', async () => {
      const id = 'uuid-123';

      mockDeleteUserUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(deleteUserUseCase.execute).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });
});