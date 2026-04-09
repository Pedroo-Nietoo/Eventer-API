import { Test, TestingModule } from '@nestjs/testing';
import { FindUserUseCase } from './find-user.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import { NotFoundException } from '@nestjs/common';

describe('FindUserUseCase', () => {
 let useCase: FindUserUseCase;
 let usersRepository: UsersRepository;

 const mockUsersRepository = {
  findById: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindUserUseCase,
    {
     provide: UsersRepository,
     useValue: mockUsersRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindUserUseCase>(FindUserUseCase);
  usersRepository = module.get<UsersRepository>(UsersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const userId = 'uuid-pedro-789';
  const mockUserEntity = {
   id: userId,
   username: 'pedronieto',
   email: 'pedro@test.com',
   role: 'USER',
   createdAt: new Date(),
  };

  const mockResponseDto = {
   id: userId,
   username: 'pedronieto',
   email: 'pedro@test.com',
  };

  it('deve retornar o usuário mapeado quando encontrado', async () => {

   mockUsersRepository.findById.mockResolvedValueOnce(mockUserEntity);
   const mapperSpy = jest.spyOn(UserMapper, 'toResponse').mockReturnValue(mockResponseDto as any);


   const result = await useCase.execute(userId);


   expect(usersRepository.findById).toHaveBeenCalledWith(userId);
   expect(mapperSpy).toHaveBeenCalledWith(mockUserEntity);
   expect(result).toEqual(mockResponseDto);
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {

   mockUsersRepository.findById.mockResolvedValueOnce(null);
   const mapperSpy = jest.spyOn(UserMapper, 'toResponse');


   await expect(useCase.execute(userId)).rejects.toThrow(
    new NotFoundException(`Usuário com o ID ${userId} não encontrado.`)
   );

   expect(mapperSpy).not.toHaveBeenCalled();
  });

  it('deve propagar erros do repositório', async () => {

   const error = new Error('Connection timeout');
   mockUsersRepository.findById.mockRejectedValueOnce(error);


   await expect(useCase.execute(userId)).rejects.toThrow(error);
  });
 });
});