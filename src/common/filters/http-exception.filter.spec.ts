import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
 let filter: HttpExceptionFilter;
 let mockRequest: any;
 let mockResponse: any;
 let mockArgumentsHost: ArgumentsHost;

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [HttpExceptionFilter],
  }).compile();

  filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

  mockRequest = {
   method: 'POST',
   url: '/api/v1/users',
   body: {},
   query: {},
   params: {},
   ip: '127.0.0.1',
   user: { id: 'user-123' },
   startTime: Date.now() - 100,
  };

  mockResponse = {
   status: jest.fn().mockReturnThis(),
   json: jest.fn(),
  };

  mockArgumentsHost = {
   switchToHttp: jest.fn().mockReturnValue({
    getRequest: () => mockRequest,
    getResponse: () => mockResponse,
   }),
  } as unknown as ArgumentsHost;

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(filter).toBeDefined();
 });

 describe('Processamento de Exceptions', () => {
  it('deve processar uma HttpException com mensagem em string', () => {
   const exception = new HttpException('Erro customizado', HttpStatus.BAD_REQUEST);

   filter.catch(exception, mockArgumentsHost);

   expect(mockResponse.status).toHaveBeenCalledWith(400);
   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     message: 'Erro customizado',
     error: 'HttpException',
    }),
   );
  });

  it('deve formatar erros de validação (array de mensagens)', () => {
   const validationResponse = {
    message: ['email invalid', 'password short'],
    error: 'Bad Request',
   };
   const exception = new HttpException(validationResponse, HttpStatus.BAD_REQUEST);

   filter.catch(exception, mockArgumentsHost);

   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     message: 'Erro de validação nos dados enviados.',
     details: ['email invalid', 'password short'],
    }),
   );
  });

  it('deve processar erros genéricos como 500 Internal Server Error', () => {
   const error = new Error('Crash total');

   filter.catch(error, mockArgumentsHost);

   expect(mockResponse.status).toHaveBeenCalledWith(500);
   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     error: 'InternalServerError',
     message: 'Erro interno no servidor.',
    }),
   );
  });

  it('deve usar o nome da exceção se o objeto de resposta não tiver o campo error', () => {
   const exception = new HttpException({ message: 'Algo falhou' }, HttpStatus.AMBIGUOUS);

   filter.catch(exception, mockArgumentsHost);

   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     error: 'HttpException',
    }),
   );
  });
 });

 describe('Mensagens de Status Mapeadas', () => {
  it('deve aplicar mensagem padrão para 401 Unauthorized se a mensagem vier vazia', () => {
   const exception = new HttpException('', HttpStatus.UNAUTHORIZED);

   filter.catch(exception, mockArgumentsHost);

   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     message: 'Acesso negado. Autenticação necessária.',
    }),
   );
  });

  it('deve aplicar "Erro inesperado." para status desconhecidos sem mensagem', () => {
   const exception = new HttpException('', HttpStatus.I_AM_A_TEAPOT);

   filter.catch(exception, mockArgumentsHost);

   expect(mockResponse.json).toHaveBeenCalledWith(
    expect.objectContaining({
     message: 'Erro inesperado.',
    }),
   );
  });
 });

 describe('Contexto e Higienização (Logging)', () => {
  it('deve omitir senhas no log do body', () => {
   mockRequest.body = { user: 'admin', password: '123' };
   const exception = new HttpException('Erro', 400);

   filter.catch(exception, mockArgumentsHost);

   const loggerSpy = Logger.prototype.error as jest.Mock;
   const logData = JSON.parse(loggerSpy.mock.calls[0][0]);

   expect(logData.context.body.password).toBe('***Omitted***');
   expect(logData.context.body.user).toBe('admin');
  });

  it('deve retornar undefined para query/params/body se estiverem vazios', () => {
   mockRequest.body = null;
   mockRequest.query = {};
   mockRequest.params = {};
   const exception = new HttpException('Erro', 400);

   filter.catch(exception, mockArgumentsHost);

   const loggerSpy = Logger.prototype.error as jest.Mock;
   const logData = JSON.parse(loggerSpy.mock.calls[0][0]);

   expect(logData.context.body).toBeUndefined();
   expect(logData.context.query).toBeUndefined();
   expect(logData.context.params).toBeUndefined();
  });

  it('deve identificar o usuário via "sub" se disponível, senão "id"', () => {
   mockRequest.user = { sub: 'subject-456' };
   filter.catch(new Error(), mockArgumentsHost);

   let logData = JSON.parse((Logger.prototype.error as jest.Mock).mock.calls[0][0]);
   expect(logData.context.userId).toBe('subject-456');

   jest.clearAllMocks();
   mockRequest.user = { id: 'id-789' };
   filter.catch(new Error(), mockArgumentsHost);

   logData = JSON.parse((Logger.prototype.error as jest.Mock).mock.calls[0][0]);
   expect(logData.context.userId).toBe('id-789');

   jest.clearAllMocks();
   delete mockRequest.user;
   filter.catch(new Error(), mockArgumentsHost);

   logData = JSON.parse((Logger.prototype.error as jest.Mock).mock.calls[0][0]);
   expect(logData.context.userId).toBe('Unauthenticated');
  });

  it('deve calcular durationMs como null se startTime não existir', () => {
   delete mockRequest.startTime;
   filter.catch(new Error(), mockArgumentsHost);

   const loggerSpy = Logger.prototype.error as jest.Mock;
   const logData = JSON.parse(loggerSpy.mock.calls[0][0]);

   expect(logData.durationMs).toBeNull();
  });

  it('deve logar o stack trace se a exceção for uma instância de Error', () => {
   const error = new Error('Stack test');
   filter.catch(error, mockArgumentsHost);

   const loggerSpy = Logger.prototype.error as jest.Mock;
   expect(loggerSpy.mock.calls[0][1]).toBeDefined();
  });
 });
});