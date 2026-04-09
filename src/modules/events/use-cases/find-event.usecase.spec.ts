import { Test, TestingModule } from '@nestjs/testing';
import { FindEventUseCase } from './find-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException } from '@nestjs/common';
import { EventMapper } from '@events/mappers/event.mapper';

describe('FindEventUseCase', () => {
 let useCase: FindEventUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findById: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    FindEventUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<FindEventUseCase>(FindEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockEventId = 'evt-123-abc';

  const mockEventEntity = {
   id: mockEventId,
   slug: 'meu-evento-123',
   title: 'Meu Evento Incrível',
   organizerId: 'org-1',
   createdAt: new Date(),
  };

  const mockEventResponseDto = {
   id: mockEventId,
   title: 'Meu Evento Incrível',
   slug: 'meu-evento-123',
  };

  it('deve retornar o EventResponseDto quando o evento for encontrado pelo ID', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEventEntity);

   const mapperSpy = jest.spyOn(EventMapper, 'toResponse').mockReturnValueOnce(mockEventResponseDto as any);

   const result = await useCase.execute(mockEventId);

   expect(mockEventsRepository.findById).toHaveBeenCalledTimes(1);
   expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);

   expect(mapperSpy).toHaveBeenCalledWith(mockEventEntity);

   expect(result).toEqual(mockEventResponseDto);
  });

  it('deve lançar NotFoundException se o evento não for encontrado', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(null);
   const mapperSpy = jest.spyOn(EventMapper, 'toResponse');

   await expect(useCase.execute(mockEventId)).rejects.toThrow(
    new NotFoundException(`Evento com ID ${mockEventId} não encontrado.`)
   );

   expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);

   expect(mapperSpy).not.toHaveBeenCalled();
  });

  it('deve propagar a exceção se a busca no banco de dados falhar catastroficamente', async () => {
   const dbError = new Error('Falha de conexão com o banco de dados');
   mockEventsRepository.findById.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(mockEventId)).rejects.toThrow(dbError);

   expect(mockEventsRepository.findById).toHaveBeenCalledTimes(1);
  });
 });
});