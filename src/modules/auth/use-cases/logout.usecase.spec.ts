import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LogoutUseCase } from './logout.usecase';
import { SessionService } from '@infra/redis/services/session.service';

describe('LogoutUseCase', () => {
 let useCase: LogoutUseCase;
 let sessionService: SessionService;

 const mockSessionService = {
  invalidatePreviousSession: jest.fn(),
 };

 beforeEach(async () => {
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });

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
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockUserId = 'user-uuid-123';

  it('deve invalidar a sessão do usuário e registrar um log de sucesso', async () => {
   mockSessionService.invalidatePreviousSession.mockResolvedValueOnce(undefined);

   const logSpy = jest.spyOn(Logger.prototype, 'log');
   logSpy.mockClear();

   await useCase.execute(mockUserId);

   expect(mockSessionService.invalidatePreviousSession).toHaveBeenCalledTimes(1);
   expect(mockSessionService.invalidatePreviousSession).toHaveBeenCalledWith(mockUserId);
   expect(logSpy).toHaveBeenCalledWith(`Sessão e índices removidos com sucesso para o usuário: ${mockUserId}`);
  });

  it('deve propagar a exceção se o SessionService falhar', async () => {
   const dbError = new Error('Redis connection failed');
   mockSessionService.invalidatePreviousSession.mockRejectedValueOnce(dbError);

   const logSpy = jest.spyOn(Logger.prototype, 'log');
   logSpy.mockClear();

   await expect(useCase.execute(mockUserId)).rejects.toThrow(dbError);

   expect(mockSessionService.invalidatePreviousSession).toHaveBeenCalledWith(mockUserId);

   expect(logSpy).not.toHaveBeenCalledWith(
    expect.stringContaining('Sessão e índices removidos com sucesso')
   );
  });
 });
});