import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LogoutUseCase } from './logout.usecase';
import { SessionService } from '@infra/redis/services/session.service';

describe('LogoutUseCase', () => {
 let useCase: LogoutUseCase;
 let sessionService: SessionService;

 const mockSessionService = {
  deleteSession: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    LogoutUseCase,
    {
     provide: SessionService,
     useValue: mockSessionService,
    },
   ],
  }).compile();

  useCase = module.get<LogoutUseCase>(LogoutUseCase);
  sessionService = module.get<SessionService>(SessionService);

  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockToken = 'opaque_token_12345';

  it('deve deletar a sessão e registrar um log de sucesso se o token for encontrado', async () => {
   mockSessionService.deleteSession.mockResolvedValueOnce(true);
   const logSpy = jest.spyOn(Logger.prototype, 'log');

   await useCase.execute(mockToken);

   expect(mockSessionService.deleteSession).toHaveBeenCalledTimes(1);
   expect(mockSessionService.deleteSession).toHaveBeenCalledWith(mockToken);
   expect(logSpy).toHaveBeenCalledWith(`Token removido com sucesso: ${mockToken}`);
  });

  it('deve registrar um log de aviso se o token não for encontrado (já deletado ou expirado)', async () => {
   mockSessionService.deleteSession.mockResolvedValueOnce(false);
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');

   await useCase.execute(mockToken);

   expect(mockSessionService.deleteSession).toHaveBeenCalledTimes(1);
   expect(mockSessionService.deleteSession).toHaveBeenCalledWith(mockToken);
   expect(warnSpy).toHaveBeenCalledWith(`Token não encontrado ou já expirado: ${mockToken}`);
  });

  it('deve propagar a exceção se o SessionService falhar', async () => {
   const dbError = new Error('Redis connection failed');
   mockSessionService.deleteSession.mockRejectedValueOnce(dbError);

   const logSpy = jest.spyOn(Logger.prototype, 'log');
   const warnSpy = jest.spyOn(Logger.prototype, 'warn');

   logSpy.mockClear();
   warnSpy.mockClear();
   await expect(useCase.execute(mockToken)).rejects.toThrow(dbError);

   expect(mockSessionService.deleteSession).toHaveBeenCalledWith(mockToken);

   expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('Token removido com sucesso'));
   expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('Token não encontrado'));
  });
 });
});