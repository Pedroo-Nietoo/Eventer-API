import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@auth/use-cases/login.usecase';
import { LogoutUseCase } from '@auth/use-cases/logout.usecase';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;

  const mockLoginUseCase = { execute: jest.fn() };
  const mockLogoutUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: LogoutUseCase,
          useValue: mockLogoutUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve chamar LoginUseCase.execute com o usuário embutido na requisição', async () => {
      const req: any = { user: { id: 'uuid-123', role: 'USER' } };
      const expectedResult = { access_token: 'opaque-token-123' };

      mockLoginUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.login(req);

      expect(loginUseCase.execute).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('deve extrair o token do header de autorização e chamar LogoutUseCase.execute', async () => {
      const req: any = {
        headers: { authorization: 'Bearer token-valido-123' },
      };

      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      await controller.logout(req);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('token-valido-123');
    });

    it('deve chamar LogoutUseCase.execute com string vazia caso o header não seja enviado', async () => {
      const req: any = { headers: {} };

      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      await controller.logout(req);

      expect(logoutUseCase.execute).toHaveBeenCalledWith('');
    });
  });
});