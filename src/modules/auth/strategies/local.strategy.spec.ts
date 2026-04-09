import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { ValidateUserUseCase } from '@auth/use-cases/validate-user.usecase';

describe('LocalStrategy', () => {
 let strategy: LocalStrategy;
 let validateUserUseCase: ValidateUserUseCase;

 const mockValidateUserUseCase = {
  execute: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    LocalStrategy,
    {
     provide: ValidateUserUseCase,
     useValue: mockValidateUserUseCase,
    },
   ],
  }).compile();

  strategy = module.get<LocalStrategy>(LocalStrategy);
  validateUserUseCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(strategy).toBeDefined();
 });

 describe('validate', () => {
  const email = 'pedro@test.com';
  const password = 'senha_super_secreta';

  it('deve retornar o usuário quando as credenciais forem válidas', async () => {
   const mockValidatedUser = {
    id: 'uuid-123',
    username: 'pedronieto',
    email: email,
    role: 'USER',
   };

   mockValidateUserUseCase.execute.mockResolvedValueOnce(mockValidatedUser);

   const result = await strategy.validate(email, password);

   expect(validateUserUseCase.execute).toHaveBeenCalledWith(email, password);
   expect(result).toEqual(mockValidatedUser);
  });

  it('deve lançar UnauthorizedException quando as credenciais forem inválidas (null)', async () => {
   mockValidateUserUseCase.execute.mockResolvedValueOnce(null);

   await expect(strategy.validate(email, password)).rejects.toThrow(
    new UnauthorizedException('E-mail ou senha incorretos.')
   );

   expect(validateUserUseCase.execute).toHaveBeenCalledWith(email, password);
  });
 });
});