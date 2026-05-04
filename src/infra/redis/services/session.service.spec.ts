import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
 let service: SessionService;

 const mockRedis = {
  set: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  del: jest.fn(),
  multi: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    SessionService,
    { provide: 'REDIS', useValue: mockRedis },
   ],
  }).compile();

  service = module.get<SessionService>(SessionService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('invalidatePreviousSession', () => {
  it('deve deletar o token antigo e a chave do usuário se existir', async () => {
   mockRedis.get.mockResolvedValueOnce('token-antigo-123');

   await service.invalidatePreviousSession('user-1');

   expect(mockRedis.get).toHaveBeenCalledWith('auth:user:user-1');
   expect(mockRedis.del).toHaveBeenCalledWith('auth:token:token-antigo-123', 'auth:user:user-1');
  });

  it('não deve chamar del se o usuário não tiver token ativo', async () => {
   mockRedis.get.mockResolvedValueOnce(null);

   await service.invalidatePreviousSession('user-1');

   expect(mockRedis.get).toHaveBeenCalledWith('auth:user:user-1');
   expect(mockRedis.del).not.toHaveBeenCalled();
  });
 });

 describe('createSession', () => {
  it('deve salvar as duas chaves na mesma transação', async () => {
   const userId = 'user-1';
   const token = 'xyz-123';
   const payload = 'jwt.payload.here';

   mockRedis.exec.mockResolvedValueOnce([]);

   await service.createSession(userId, token, payload);

   expect(mockRedis.multi).toHaveBeenCalled();
   expect(mockRedis.set).toHaveBeenCalledWith(`auth:token:${token}`, payload, 'EX', 900);
   expect(mockRedis.set).toHaveBeenCalledWith(`auth:user:${userId}`, token, 'EX', 900);
   expect(mockRedis.exec).toHaveBeenCalled();
  });
 });

 describe('getSession', () => {
  const token = 'xyz-123';
  const key = `auth:token:${token}`;

  it('deve retornar o payload e renovar o TTL se a sessão existir', async () => {
   const mockPayload = 'payload_data';
   mockRedis.exec.mockResolvedValueOnce([[null, mockPayload], [null, 1]]);

   const result = await service.getSession(token);

   expect(result).toBe(mockPayload);
   expect(mockRedis.multi).toHaveBeenCalled();
   expect(mockRedis.get).toHaveBeenCalledWith(key);
   expect(mockRedis.expire).toHaveBeenCalledWith(key, 900);
   expect(mockRedis.exec).toHaveBeenCalled();
  });

  it('deve retornar null se a sessão não existir', async () => {
   mockRedis.exec.mockResolvedValueOnce([[null, null], [null, 0]]);
   const result = await service.getSession(token);
   expect(result).toBeNull();
  });

  it('deve retornar null se houver um erro durante a execução do comando get no Redis', async () => {
   mockRedis.exec.mockResolvedValueOnce([[new Error(), null], [null, 0]]);
   const result = await service.getSession(token);
   expect(result).toBeNull();
  });

  it('deve retornar null se o exec() retornar um valor nulo/indefinido (falha na transação)', async () => {
   mockRedis.exec.mockResolvedValueOnce(null);
   const result = await service.getSession(token);
   expect(result).toBeNull();
  });

  it('deve propagar a exceção se o comando exec falhar catastroficamente', async () => {
   const dbError = new Error('Redis timeout during multi execution');
   mockRedis.exec.mockRejectedValueOnce(dbError);
   await expect(service.getSession(token)).rejects.toThrow(dbError);
  });
 });

 describe('deleteSession', () => {
  it('deve retornar true se a sessão for deletada com sucesso', async () => {
   mockRedis.del.mockResolvedValueOnce(1);
   const result = await service.deleteSession('xyz-123');
   expect(result).toBe(true);
   expect(mockRedis.del).toHaveBeenCalledWith('auth:token:xyz-123');
  });

  it('deve retornar false se a sessão não existir para ser deletada', async () => {
   mockRedis.del.mockResolvedValueOnce(0);
   const result = await service.deleteSession('xyz-123');
   expect(result).toBe(false);
  });
 });
});