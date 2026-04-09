import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserUseCase } from './validate-user.usecase';
import { FindUserByEmailUseCase } from '@users/use-cases/find-user-by-email.usecase';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
 compare: jest.fn(),
}));

describe('ValidateUserUseCase', () => {
 let useCase: ValidateUserUseCase;
 let findUserByEmailUseCase: FindUserByEmailUseCase;

 const mockFindUserByEmailUseCase = {
  execute: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ValidateUserUseCase,
    {
     provide: FindUserByEmailUseCase,
     useValue: mockFindUserByEmailUseCase,
    },
   ],
  }).compile();

  useCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
  findUserByEmailUseCase = module.get<FindUserByEmailUseCase>(FindUserByEmailUseCase);
 });

 afterEach(() => {
  jest.resetAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockEmail = 'teste@email.com';
  const mockPassword = 'senha_em_texto_plano';

  const mockUserFromDb = {
   id: 'uuid-123',
   email: mockEmail,
   name: 'Usuário Teste',
   password: 'hashed_password_from_db',
   role: 'USER',
  };

  it('deve retornar o usuário sem a senha se as credenciais forem válidas (Sucesso)', async () => {
   mockFindUserByEmailUseCase.execute.mockResolvedValueOnce(mockUserFromDb);

   (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

   const result = await useCase.execute(mockEmail, mockPassword);

   expect(mockFindUserByEmailUseCase.execute).toHaveBeenCalledWith(mockEmail);
   expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUserFromDb.password);

   expect(result).not.toBeNull();
   expect(result).not.toHaveProperty('password');
   expect(result).toHaveProperty('id', mockUserFromDb.id);
   expect(result).toHaveProperty('email', mockUserFromDb.email);
  });

  it('deve retornar null se o email não for encontrado', async () => {
   mockFindUserByEmailUseCase.execute.mockResolvedValueOnce(null);

   const result = await useCase.execute(mockEmail, mockPassword);

   expect(result).toBeNull();
   expect(mockFindUserByEmailUseCase.execute).toHaveBeenCalledWith(mockEmail);

   expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('deve retornar null se a senha estiver incorreta', async () => {
   mockFindUserByEmailUseCase.execute.mockResolvedValueOnce(mockUserFromDb);

   (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

   const result = await useCase.execute(mockEmail, mockPassword);

   expect(result).toBeNull();
   expect(mockFindUserByEmailUseCase.execute).toHaveBeenCalledWith(mockEmail);
   expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockUserFromDb.password);
  });

  it('deve propagar erro se o FindUserByEmailUseCase falhar (Falha de Infra)', async () => {
   const dbError = new Error('Database Timeout');
   mockFindUserByEmailUseCase.execute.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(mockEmail, mockPassword)).rejects.toThrow(dbError);
  });

  it('deve propagar erro se o bcrypt falhar catastroficamente', async () => {
   mockFindUserByEmailUseCase.execute.mockResolvedValueOnce(mockUserFromDb);

   const bcryptError = new Error('Bcrypt internal error');
   (bcrypt.compare as jest.Mock).mockRejectedValueOnce(bcryptError);

   await expect(useCase.execute(mockEmail, mockPassword)).rejects.toThrow(bcryptError);
  });
 });
});