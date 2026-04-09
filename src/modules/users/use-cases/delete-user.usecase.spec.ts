import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from './delete-user.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeleteUserUseCase', () => {
 let useCase: DeleteUserUseCase;
 let usersRepository: UsersRepository;

 const mockUsersRepository = {
  softDelete: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteUserUseCase,
    {
     provide: UsersRepository,
     useValue: mockUsersRepository,
    },
   ],
  }).compile();

  useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
  usersRepository = module.get<UsersRepository>(UsersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const userId = 'uuid-pedro-123';

  it('deve realizar o soft delete com sucesso', async () => {

   mockUsersRepository.softDelete.mockResolvedValueOnce({ affected: 1 });


   await expect(useCase.execute(userId)).resolves.not.toThrow();
   expect(mockUsersRepository.softDelete).toHaveBeenCalledWith(userId);
   expect(mockUsersRepository.softDelete).toHaveBeenCalledTimes(1);
  });

  it('deve lançar NotFoundException quando nenhum usuário for afetado', async () => {

   mockUsersRepository.softDelete.mockResolvedValueOnce({ affected: 0 });


   await expect(useCase.execute(userId)).rejects.toThrow(
    new NotFoundException(`Usuário com o ID ${userId} não encontrado.`)
   );
  });

  it('deve propagar erros inesperados do repositório', async () => {

   const dbError = new Error('Database connection failed');
   mockUsersRepository.softDelete.mockRejectedValueOnce(dbError);


   await expect(useCase.execute(userId)).rejects.toThrow(dbError);
  });
 });
});