import { Test, TestingModule } from '@nestjs/testing';
import { DeleteEventUseCase } from './delete-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@common/enums/role.enum';
import { CacheService } from '@infra/redis/services/cache.service';

describe('DeleteEventUseCase', () => {
 let useCase: DeleteEventUseCase;
 let eventsRepository: EventsRepository;
 let cacheService: CacheService;

 const mockEventsRepository = {
  findById: jest.fn(),
  softDelete: jest.fn(),
 };

 const mockCacheService = {
  del: jest.fn(),
  delByPattern: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    DeleteEventUseCase,
    { provide: EventsRepository, useValue: mockEventsRepository },
    { provide: CacheService, useValue: mockCacheService },
   ],
  }).compile();

  useCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
  cacheService = module.get<CacheService>(CacheService);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve excluir o evento com sucesso e invalidar o cache', async () => {
  const mockEventId = 'evt-123';
  const mockEvent = { id: mockEventId, slug: 'meu-evento', organizerId: 'org-1' };

  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
  mockEventsRepository.softDelete.mockResolvedValueOnce(undefined);

  await useCase.execute(mockEventId, 'org-1', UserRole.USER);

  expect(mockEventsRepository.softDelete).toHaveBeenCalledWith(mockEventId);
  expect(mockCacheService.del).toHaveBeenCalledWith(`events:id:${mockEventId}`);
  expect(mockCacheService.del).toHaveBeenCalledWith(`events:slug:${mockEvent.slug}`);
  expect(mockCacheService.delByPattern).toHaveBeenCalledWith('events:list:*');
 });

 it('deve excluir o evento com sucesso se for ADMIN (mesmo não sendo dono) e limpar cache', async () => {
  const mockEventId = 'evt-123';
  const mockEvent = { id: mockEventId, slug: 'meu-evento', organizerId: 'org-1' };

  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
  mockEventsRepository.softDelete.mockResolvedValueOnce(undefined);

  await useCase.execute(mockEventId, 'outro-id', UserRole.ADMIN);

  expect(mockEventsRepository.softDelete).toHaveBeenCalledWith(mockEventId);
  expect(mockCacheService.del).toHaveBeenCalled();
 });

 it('deve lançar NotFoundException se o evento não existir', async () => {
  mockEventsRepository.findById.mockResolvedValueOnce(null);

  await expect(useCase.execute('id', 'org', UserRole.USER)).rejects.toThrow(NotFoundException);
  expect(mockEventsRepository.softDelete).not.toHaveBeenCalled();
  expect(mockCacheService.del).not.toHaveBeenCalled();
 });

 it('deve lançar ForbiddenException se não for dono nem ADMIN', async () => {
  mockEventsRepository.findById.mockResolvedValueOnce({ organizerId: 'dono', slug: 'teste' });

  await expect(useCase.execute('id', 'hacker', UserRole.USER)).rejects.toThrow(ForbiddenException);
  expect(mockEventsRepository.softDelete).not.toHaveBeenCalled();
 });
});