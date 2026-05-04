import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '@infra/redis/services/session.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.usecase';

describe('LoginUseCase', () => {
 let useCase: LoginUseCase;
 let sessionService: SessionService;
 let jwtService: JwtService;

 const mockSessionService = {
  createSession: jest.fn(),
  invalidatePreviousSession: jest.fn(),
 };

 const mockJwtService = {
  signAsync: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    LoginUseCase,
    { provide: SessionService, useValue: mockSessionService },
    { provide: JwtService, useValue: mockJwtService },
   ],
  }).compile();

  useCase = module.get<LoginUseCase>(LoginUseCase);
  sessionService = module.get<SessionService>(SessionService);
  jwtService = module.get<JwtService>(JwtService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockUser = { id: 'uuid-user-123', role: 'ADMIN' } as any;
  const mockJwtToken = 'header.payload.signature';

  it('deve invalidar a sessão antiga, gerar o JWT, criar o token opaco e salvar no Redis', async () => {
   mockSessionService.invalidatePreviousSession.mockResolvedValueOnce(undefined);
   mockJwtService.signAsync.mockResolvedValueOnce(mockJwtToken);
   mockSessionService.createSession.mockResolvedValueOnce(undefined);

   const result = await useCase.execute(mockUser);

   expect(mockSessionService.invalidatePreviousSession).toHaveBeenCalledWith(mockUser.id);

   expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
   expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id, role: mockUser.role });

   expect(result).toHaveProperty('access_token');
   expect(result.access_token).toHaveLength(64);

   expect(mockSessionService.createSession).toHaveBeenCalledTimes(1);
   expect(mockSessionService.createSession).toHaveBeenCalledWith(mockUser.id, result.access_token, mockJwtToken);
  });

  it('deve propagar erro se a invalidação da sessão falhar', async () => {
   const errorToThrow = new Error('Erro Redis na invalidação');
   mockSessionService.invalidatePreviousSession.mockRejectedValueOnce(errorToThrow);

   await expect(useCase.execute(mockUser)).rejects.toThrow(errorToThrow);

   expect(mockJwtService.signAsync).not.toHaveBeenCalled();
   expect(mockSessionService.createSession).not.toHaveBeenCalled();
  });

  it('deve lançar um erro se o JwtService falhar ao assinar o token', async () => {
   const errorToThrow = new Error('Erro interno do JWT');
   mockSessionService.invalidatePreviousSession.mockResolvedValueOnce(undefined);
   mockJwtService.signAsync.mockRejectedValueOnce(errorToThrow);

   await expect(useCase.execute(mockUser)).rejects.toThrow(errorToThrow);

   expect(mockSessionService.createSession).not.toHaveBeenCalled();
  });

  it('deve lançar um erro se o SessionService falhar ao salvar no Redis', async () => {
   const errorToThrow = new Error('Redis Timeout no Create');
   mockSessionService.invalidatePreviousSession.mockResolvedValueOnce(undefined);
   mockJwtService.signAsync.mockResolvedValueOnce(mockJwtToken);
   mockSessionService.createSession.mockRejectedValueOnce(errorToThrow);

   await expect(useCase.execute(mockUser)).rejects.toThrow(errorToThrow);
  });
 });
});