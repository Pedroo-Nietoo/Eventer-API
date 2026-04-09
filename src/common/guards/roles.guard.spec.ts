import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@common/enums/role.enum';

describe('RolesGuard', () => {
 let guard: RolesGuard;
 let reflector: Reflector;

 const mockReflector = {
  getAllAndOverride: jest.fn(),
 };

 const mockGetRequest = jest.fn();
 const mockExecutionContext = {
  getHandler: jest.fn(),
  getClass: jest.fn(),
  switchToHttp: jest.fn().mockReturnValue({
   getRequest: mockGetRequest,
  }),
 } as unknown as ExecutionContext;

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    RolesGuard,
    {
     provide: Reflector,
     useValue: mockReflector,
    },
   ],
  }).compile();

  guard = module.get<RolesGuard>(RolesGuard);
  reflector = module.get<Reflector>(Reflector);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(guard).toBeDefined();
 });

 it('deve permitir acesso se não houver roles configuradas no decorator', () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce(undefined);

  const result = guard.canActivate(mockExecutionContext);

  expect(result).toBe(true);
  expect(mockGetRequest).not.toHaveBeenCalled();
 });

 it('deve negar acesso se o request não possuir usuário autenticado', () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce({ allow: [UserRole.ADMIN] });
  mockGetRequest.mockReturnValueOnce({});

  const result = guard.canActivate(mockExecutionContext);

  expect(result).toBe(false);
 });

 it('deve negar acesso se o usuário não possuir um role definido', () => {
  mockReflector.getAllAndOverride.mockReturnValueOnce({ allow: [UserRole.ADMIN] });
  mockGetRequest.mockReturnValueOnce({ user: { id: '123' } });

  const result = guard.canActivate(mockExecutionContext);

  expect(result).toBe(false);
 });

 describe('Lógica de Deny (Lista Negra)', () => {
  it('deve negar acesso se o role do usuário estiver na lista deny', () => {
   mockReflector.getAllAndOverride.mockReturnValueOnce({ deny: [UserRole.USER] });
   mockGetRequest.mockReturnValueOnce({ user: { role: UserRole.USER } });

   const result = guard.canActivate(mockExecutionContext);

   expect(result).toBe(false);
  });
 });

 describe('Lógica de Allow (Lista Branca)', () => {
  it('deve permitir acesso se o role do usuário estiver na lista allow', () => {
   mockReflector.getAllAndOverride.mockReturnValueOnce({ allow: [UserRole.ADMIN, UserRole.USER] });
   mockGetRequest.mockReturnValueOnce({ user: { role: UserRole.ADMIN } });

   const result = guard.canActivate(mockExecutionContext);

   expect(result).toBe(true);
  });

  it('deve negar acesso se a lista allow existir, mas o role não estiver nela', () => {
   mockReflector.getAllAndOverride.mockReturnValueOnce({ allow: [UserRole.ADMIN] });
   mockGetRequest.mockReturnValueOnce({ user: { role: UserRole.USER } });

   const result = guard.canActivate(mockExecutionContext);

   expect(result).toBe(false);
  });

  it('deve permitir acesso se não estiver no deny e a lista allow for vazia/inexistente', () => {
   mockReflector.getAllAndOverride.mockReturnValueOnce({ deny: ['GUEST'] });
   mockGetRequest.mockReturnValueOnce({ user: { role: UserRole.USER } });

   const result = guard.canActivate(mockExecutionContext);

   expect(result).toBe(true);
  });
 });
});