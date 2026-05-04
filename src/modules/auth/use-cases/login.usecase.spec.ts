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
 };

 const mockJwtService = {
  signAsync: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    LoginUseCase,
    {
     provide: SessionService,
     useValue: mockSessionService,
    },
    {
     provide: JwtService,
     useValue: mockJwtService,
    },
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
  it('deve gerar o JWT, criar o token opaco, salvar no Redis e retornar o token opaco', async () => {
   const mockUser = {
    id: 'uuid-user-123',
    role: 'ADMIN',
   } as any;

   const mockJwtToken = 'header.payload.signature';

   mockJwtService.signAsync.mockResolvedValueOnce(mockJwtToken);
   mockSessionService.createSession.mockResolvedValueOnce(undefined);

   const result = await useCase.execute(mockUser);

   expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
   expect(mockJwtService.signAsync).toHaveBeenCalledWith({
    sub: mockUser.id,
    role: mockUser.role,
   });

   expect(result).toHaveProperty('access_token');
   expect(typeof result.access_token).toBe('string');
   expect(result.access_token.length).toBe(64);

   expect(mockSessionService.createSession).toHaveBeenCalledTimes(1);
   expect(mockSessionService.createSession).toHaveBeenCalledWith(
    result.access_token,
    mockJwtToken,
   );
  });

  it('deve lançar um erro se o JwtService falhar ao assinar o token', async () => {
   const mockUser = { id: 'uuid-123', role: 'USER' } as any;
   const errorToThrow = new Error('Erro interno do JWT');

   mockJwtService.signAsync.mockRejectedValueOnce(errorToThrow);

   await expect(useCase.execute(mockUser)).rejects.toThrow(errorToThrow);
   expect(mockSessionService.createSession).not.toHaveBeenCalled();
  });

  it('deve lançar um erro se o SessionService falhar ao salvar no Redis', async () => {
   const mockUser = { id: 'uuid-456', role: 'ADMIN' } as any;
   const mockJwtToken = 'header.payload.signature';
   const errorToThrow = new Error('Redis Timeout');

   mockJwtService.signAsync.mockResolvedValueOnce(mockJwtToken);
   mockSessionService.createSession.mockRejectedValueOnce(errorToThrow);

   await expect(useCase.execute(mockUser)).rejects.toThrow(errorToThrow);

   expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
   expect(mockSessionService.createSession).toHaveBeenCalledTimes(1);
  });
 });
});