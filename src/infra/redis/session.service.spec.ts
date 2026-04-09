import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
 let service: SessionService;

 const mockRedis = {
  set: jest.fn(),
  del: jest.fn(),
  multi: jest.fn().mockReturnThis(),
  get: jest.fn().mockReturnThis(),
  expire: jest.fn().mockReturnThis(),
  exec: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    SessionService,
    {
     provide: 'REDIS',
     useValue: mockRedis,
    },
   ],
  }).compile();

  service = module.get<SessionService>(SessionService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(service).toBeDefined();
 });

 describe('createSession', () => {
  it('deve salvar a sessão no Redis com o TTL correto', async () => {
   const token = 'xyz-123';
   const payload = JSON.stringify({ userId: 1, role: 'ADMIN' });

   await service.createSession(token, payload);

   expect(mockRedis.set).toHaveBeenCalledWith(
    `token:${token}`,
    payload,
    'EX',
    900,
   );
  });

  it('deve propagar a exceção se a conexão com o Redis falhar ao salvar', async () => {
   const dbError = new Error('Redis connection lost');
   mockRedis.set.mockRejectedValueOnce(dbError);

   const token = 'xyz-123';
   const payload = JSON.stringify({ userId: 1 });

   await expect(service.createSession(token, payload)).rejects.toThrow(dbError);
   expect(mockRedis.set).toHaveBeenCalledTimes(1);
  });
 });

 describe('getSession', () => {
  const token = 'xyz-123';
  const key = `token:${token}`;

  it('deve retornar o payload e renovar o TTL se a sessão existir', async () => {
   const mockPayload = 'payload_data';

   mockRedis.exec.mockResolvedValueOnce([
    [null, mockPayload],
    [null, 1],
   ]);

   const result = await service.getSession(token);

   expect(result).toBe(mockPayload);
   expect(mockRedis.multi).toHaveBeenCalled();
   expect(mockRedis.get).toHaveBeenCalledWith(key);
   expect(mockRedis.expire).toHaveBeenCalledWith(key, 900);
   expect(mockRedis.exec).toHaveBeenCalled();
  });

  it('deve retornar null se a sessão não existir', async () => {
   mockRedis.exec.mockResolvedValueOnce([
    [null, null],
    [null, 0],
   ]);

   const result = await service.getSession(token);

   expect(result).toBeNull();
  });

  it('deve retornar null se houver um erro durante a execução do comando get no Redis', async () => {
   const mockError = new Error('Redis Error');
   mockRedis.exec.mockResolvedValueOnce([
    [mockError, null],
    [null, 0],
   ]);

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
   expect(mockRedis.del).toHaveBeenCalledWith('token:xyz-123');
  });

  it('deve retornar false se a sessão não existir para ser deletada', async () => {
   mockRedis.del.mockResolvedValueOnce(0);

   const result = await service.deleteSession('xyz-123');

   expect(result).toBe(false);
   expect(mockRedis.del).toHaveBeenCalledWith('token:xyz-123');
  });
 });

 it('deve propagar a exceção se a conexão com o Redis falhar ao deletar', async () => {
  const dbError = new Error('Redis cluster down');
  mockRedis.del.mockRejectedValueOnce(dbError);

  await expect(service.deleteSession('xyz-123')).rejects.toThrow(dbError);
  expect(mockRedis.del).toHaveBeenCalledTimes(1);
 });
});