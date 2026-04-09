import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByEmailUseCase } from './find-user-by-email.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { User } from '@users/entities/user.entity';

describe('FindUserByEmailUseCase', () => {
 let useCase: FindUserByEmailUseCase;
 let usersRepository: UsersRepository;

 const mockUsersRepository = {
  findByEmailWithPassword: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindUserByEmailUseCase,
    {
     provide: UsersRepository,
     useValue: mockUsersRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindUserByEmailUseCase>(FindUserByEmailUseCase);
  usersRepository = module.get<UsersRepository>(UsersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const email = 'pedro@test.com';
  const mockUser = {
   id: 'uuid-123',
   email: email,
   password: 'hashed_password',
   username: 'pedronieto',
  } as User;

  it('deve retornar o usuário quando o e-mail for encontrado', async () => {

   mockUsersRepository.findByEmailWithPassword.mockResolvedValueOnce(mockUser);


   const result = await useCase.execute(email);


   expect(usersRepository.findByEmailWithPassword).toHaveBeenCalledWith(email);
   expect(result).toEqual(mockUser);
   expect(result?.password).toBeDefined();
  });

  it('deve retornar null quando o usuário não for encontrado', async () => {

   mockUsersRepository.findByEmailWithPassword.mockResolvedValueOnce(null);


   const result = await useCase.execute('inexistente@test.com');


   expect(result).toBeNull();
  });

  it('deve propagar erros do repositório', async () => {

   const error = new Error('Erro de conexão');
   mockUsersRepository.findByEmailWithPassword.mockRejectedValueOnce(error);


   await expect(useCase.execute(email)).rejects.toThrow(error);
  });
 });
});