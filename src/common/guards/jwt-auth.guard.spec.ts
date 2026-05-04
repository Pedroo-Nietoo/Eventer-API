import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionService } from '@infra/redis/services/session.service';

describe('JwtAuthGuard', () => {
 let guard: JwtAuthGuard;
 let reflector: Reflector;
 let sessionService: SessionService;
 let jwtService: JwtService;

 const mockReflector = {
  getAllAndOverride: jest.fn(),
 };

 const mockSessionService = {
  getSession: jest.fn(),
 };

 const mockJwtService = {
  verifyAsync: jest.fn(),
 };

 let mockRequest: any;
 let mockExecutionContext: ExecutionContext;

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    JwtAuthGuard,
    { provide: Reflector, useValue: mockReflector },
    { provide: SessionService, useValue: mockSessionService },
    { provide: JwtService, useValue: mockJwtService },
   ],
  }).compile();

  guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  reflector = module.get<Reflector>(Reflector);
  sessionService = module.get<SessionService>(SessionService);
  jwtService = module.get<JwtService>(JwtService);

  mockRequest = { headers: {} };
  mockExecutionContext = {
   getHandler: jest.fn(),
   getClass: jest.fn(),
   switchToHttp: jest.fn().mockReturnValue({
    getRequest: () => mockRequest,
   }),
  } as unknown as ExecutionContext;
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(guard).toBeDefined();
 });

 it('deve permitir acesso imediato se a rota for pública (@Public)', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(true);

  const result = await guard.canActivate(mockExecutionContext);

  expect(result).toBe(true);
  expect(mockSessionService.getSession).not.toHaveBeenCalled();
 });

 it('deve lançar UnauthorizedException se não houver cabeçalho de autorização', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(false);
  mockRequest.headers.authorization = undefined;

  await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
   new UnauthorizedException('Cabeçalho de autorização inválido')
  );
 });

 it('deve lançar UnauthorizedException se o token não começar com Bearer', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(false);
  mockRequest.headers.authorization = 'Basic token-basico-aqui';

  await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
   new UnauthorizedException('Cabeçalho de autorização inválido')
  );
 });

 it('deve lançar UnauthorizedException se o token opaco não existir no Redis', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(false);
  mockRequest.headers.authorization = 'Bearer opaque-token-123';
  mockSessionService.getSession.mockResolvedValueOnce(null);

  await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
   new UnauthorizedException('Sessão expirada ou token inválido')
  );
  expect(mockSessionService.getSession).toHaveBeenCalledWith('opaque-token-123');
 });

 it('deve lançar UnauthorizedException se o JWT interno for inválido', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(false);
  mockRequest.headers.authorization = 'Bearer opaque-token-123';

  const fakeJwt = 'eyJhbGciOiJIUzI1Ni...';
  mockSessionService.getSession.mockResolvedValueOnce(fakeJwt);
  mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('JWT Expired'));

  await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
   new UnauthorizedException('Falha na validação do token interno')
  );
  expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(fakeJwt);
 });

 it('deve permitir o acesso e injetar o usuário no request no caminho feliz', async () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(false);
  mockRequest.headers.authorization = 'Bearer opaque-token-123';

  const fakeJwt = 'jwt-valido-do-redis';
  const payload = { sub: 'user-uuid-999', role: 'ADMIN' };

  mockSessionService.getSession.mockResolvedValueOnce(fakeJwt);
  mockJwtService.verifyAsync.mockResolvedValueOnce(payload);

  const result = await guard.canActivate(mockExecutionContext);

  expect(result).toBe(true);
  expect(mockRequest.user).toEqual({
   id: 'user-uuid-999',
   role: 'ADMIN',
  });
 });
});