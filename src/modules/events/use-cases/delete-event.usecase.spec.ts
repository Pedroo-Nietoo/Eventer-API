import { Test, TestingModule } from '@nestjs/testing';
import { DeleteEventUseCase } from './delete-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';

describe('DeleteEventUseCase', () => {
 let useCase: DeleteEventUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findById: jest.fn(),
  softDelete: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteEventUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockEventId = 'evt-123';
  const mockOrganizerId = 'user-organizer-1';
  const mockOtherUserId = 'user-other-99';

  const mockEvent = {
   id: mockEventId,
   organizerId: mockOrganizerId,
   title: 'Festa de Fim de Ano',
  };

  it('deve excluir o evento com sucesso se o usuário for o organizador', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.softDelete.mockResolvedValueOnce(undefined);

   await useCase.execute(mockEventId, mockOrganizerId, UserRole.USER);

   expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);
   expect(mockEventsRepository.softDelete).toHaveBeenCalledWith(mockEventId);
   expect(mockEventsRepository.softDelete).toHaveBeenCalledTimes(1);
  });

  it('deve excluir o evento com sucesso se o usuário for um ADMIN (mesmo não sendo o organizador)', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.softDelete.mockResolvedValueOnce(undefined);
   await useCase.execute(mockEventId, mockOtherUserId, UserRole.ADMIN);

   expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);
   expect(mockEventsRepository.softDelete).toHaveBeenCalledWith(mockEventId);
  });

  it('deve lançar NotFoundException se o evento não existir', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(null);
   await expect(useCase.execute(mockEventId, mockOrganizerId, UserRole.USER)).rejects.toThrow(
    new NotFoundException(`Evento com ID ${mockEventId} não encontrado.`)
   );

   expect(mockEventsRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve lançar ForbiddenException se o usuário não for o dono nem ADMIN', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   await expect(useCase.execute(mockEventId, mockOtherUserId, UserRole.USER)).rejects.toThrow(
    new ForbiddenException('Você não tem permissão para excluir este evento.')
   );

   expect(mockEventsRepository.findById).toHaveBeenCalledWith(mockEventId);

   expect(mockEventsRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve propagar erro se a busca pelo evento (findById) falhar catastroficamente', async () => {
   const dbError = new Error('Database connection lost');
   mockEventsRepository.findById.mockRejectedValueOnce(dbError);
   await expect(useCase.execute(mockEventId, mockOrganizerId, UserRole.USER)).rejects.toThrow(dbError);

   expect(mockEventsRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve propagar erro se a exclusão (softDelete) falhar catastroficamente', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

   const dbError = new Error('Deadlock found when trying to get lock');
   mockEventsRepository.softDelete.mockRejectedValueOnce(dbError);
   await expect(useCase.execute(mockEventId, mockOrganizerId, UserRole.USER)).rejects.toThrow(dbError);
  });
 });
});