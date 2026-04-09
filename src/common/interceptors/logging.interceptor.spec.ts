import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
 let interceptor: LoggingInterceptor;

 const mockRequest: any = {
  method: 'GET',
  originalUrl: '/api/v1/events',
  startTime: undefined,
 };

 const mockResponse: any = {
  statusCode: 200,
 };

 const mockExecutionContext = {
  switchToHttp: jest.fn().mockReturnValue({
   getRequest: () => mockRequest,
   getResponse: () => mockResponse,
  }),
 } as unknown as ExecutionContext;

 const mockCallHandler = {
  handle: jest.fn().mockReturnValue(of('response_data')),
 } as CallHandler;

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [LoggingInterceptor],
  }).compile();

  interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(interceptor).toBeDefined();
 });

 it('deve definir o startTime no request e registrar o log de sucesso', (done) => {
  interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
   next: () => {
    expect(mockRequest.startTime).toBeDefined();

    const loggerSpy = Logger.prototype.log as jest.Mock;

    const logCall = loggerSpy.mock.calls.find(call =>
     call[0].includes('http_request_success')
    );

    expect(logCall).toBeDefined();
    const logData = JSON.parse(logCall[0]);

    expect(logData).toEqual(
     expect.objectContaining({
      event: 'http_request_success',
      method: 'GET',
      url: '/api/v1/events',
      statusCode: 200,
     })
    );
    expect(typeof logData.durationMs).toBe('number');
    done();
   },
  });
 });

 it('deve chamar o next.handle() corretamente', () => {
  interceptor.intercept(mockExecutionContext, mockCallHandler);
  expect(mockCallHandler.handle).toHaveBeenCalled();
 });
});