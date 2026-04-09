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

 it('deve processar uma HttpException padrão (Ex: 404 Not Found)', () => {
  const exception = new HttpException('Recurso não encontrado', HttpStatus.NOT_FOUND);

  filter.catch(exception, mockArgumentsHost);

  expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  expect(mockResponse.json).toHaveBeenCalledWith(
   expect.objectContaining({
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Recurso não encontrado',
    error: 'HttpException',
    path: '/api/v1/users',
   })
  );
 });

 it('deve formatar arrays de validação gerados pelo class-validator', () => {
  const validationResponse = {
   message: ['email is not valid', 'password is too short'],
   error: 'Bad Request',
   statusCode: 400,
  };
  const exception = new HttpException(validationResponse, HttpStatus.BAD_REQUEST);

  filter.catch(exception, mockArgumentsHost);

  expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  expect(mockResponse.json).toHaveBeenCalledWith(
   expect.objectContaining({
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Erro de validação nos dados enviados.',
    details: ['email is not valid', 'password is too short'],
   })
  );
 });

 it('deve processar erros genéricos (não-HttpException) como 500 Internal Server Error', () => {
  const unexpectedError = new TypeError('Cannot read property of undefined');

  filter.catch(unexpectedError, mockArgumentsHost);

  expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  expect(mockResponse.json).toHaveBeenCalledWith(
   expect.objectContaining({
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Erro interno no servidor.',
    error: 'InternalServerError',
   })
  );
 });

 it('deve aplicar as mensagens padrão mapeadas para status específicos (Ex: 429 Too Many Requests)', () => {
  const exception = new HttpException('', HttpStatus.TOO_MANY_REQUESTS);

  filter.catch(exception, mockArgumentsHost);

  expect(mockResponse.json).toHaveBeenCalledWith(
   expect.objectContaining({
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Excesso de requisições realizadas. Por favor, tente novamente mais tarde.',
   })
  );
 });

 it('deve higienizar o campo "password" no body antes de enviar para o Logger', () => {
  mockRequest.body = {
   email: 'pedro@test.com',
   password: 'minha-senha-secreta',
  };
  const exception = new HttpException('Erro genérico', HttpStatus.BAD_REQUEST);

  filter.catch(exception, mockArgumentsHost);

  const loggerSpy = Logger.prototype.error as jest.Mock;
  const logCallString = loggerSpy.mock.calls[0][0];
  const logData = JSON.parse(logCallString);

  expect(logData.context.body.email).toBe('pedro@test.com');
  expect(logData.context.body.password).toBe('***Omitted***');
  expect(logData.context.body.password).not.toBe('minha-senha-secreta');
 });

 it('deve registrar corretamente o contexto e a duração no Logger', () => {
  mockRequest.query = { search: 'show' };
  const exception = new HttpException('Teste de Log', HttpStatus.BAD_REQUEST);

  filter.catch(exception, mockArgumentsHost);

  expect(Logger.prototype.error).toHaveBeenCalled();
  const loggerSpy = Logger.prototype.error as jest.Mock;
  const logData = JSON.parse(loggerSpy.mock.calls[0][0]);

  expect(logData.event).toBe('http_request_error');
  expect(logData.url).toBe('/api/v1/users');
  expect(logData.statusCode).toBe(400);
  expect(logData.context.userId).toBe('user-123');
  expect(logData.context.query).toEqual({ search: 'show' });
  expect(typeof logData.durationMs).toBe('number');
 });
});