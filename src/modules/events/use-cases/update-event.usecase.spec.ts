import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEventUseCase } from './update-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { EventMapper } from '@events/mappers/event.mapper';
import { UserRole } from '@common/enums/role.enum';
import { ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { CacheService } from '@infra/redis/services/cache.service';

jest.mock('@common/utils/generate-slug', () => ({
 __esModule: true,
 default: jest.fn((val: string) => val.toLowerCase().replaceAll(/ /g, '-')),
}));

describe('UpdateEventUseCase', () => {
 let useCase: UpdateEventUseCase;

 const mockEventsRepository = { findById: jest.fn(), save: jest.fn() };
 const mockCacheService = { del: jest.fn(), delByPattern: jest.fn() };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    UpdateEventUseCase,
    { provide: EventsRepository, useValue: mockEventsRepository },
    { provide: CacheService, useValue: mockCacheService },
   ],
  }).compile();

  useCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 const mockId = 'evt-123';
 const mockEvent = { id: mockId, organizerId: 'user-1', slug: 'slug-antigo' };

 it('deve atualizar o evento, invalidar cache do ID, slug antigo, slug novo e das listas', async () => {
  const dto = { title: 'New Title', slug: 'novo-slug', latitude: -23, longitude: -46 };
  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
  mockEventsRepository.save.mockImplementationOnce((val) => Promise.resolve(val));
  jest.spyOn(EventMapper, 'toResponse').mockReturnValue({} as any);

  await useCase.execute(mockId, dto, 'user-1', UserRole.USER);

  expect(mockEventsRepository.save).toHaveBeenCalled();
  expect(mockCacheService.del).toHaveBeenCalledWith(`events:id:${mockId}`);
  expect(mockCacheService.del).toHaveBeenCalledWith(`events:slug:slug-antigo`);
  expect(mockCacheService.del).toHaveBeenCalledWith(`events:slug:novo-slug`);
  expect(mockCacheService.delByPattern).toHaveBeenCalledWith('events:list:*');
 });

 it('deve retornar o evento original sem alterar banco nem cache se o DTO for vazio', async () => {
  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

  await useCase.execute(mockId, {}, 'user-1', UserRole.USER);

  expect(mockEventsRepository.save).not.toHaveBeenCalled();
  expect(mockCacheService.del).not.toHaveBeenCalled();
  expect(mockCacheService.delByPattern).not.toHaveBeenCalled();
 });

 it('deve lançar ForbiddenException e não limpar cache se não for o dono', async () => {
  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

  await expect(useCase.execute(mockId, { title: 'Hack' }, 'wrong-user', UserRole.USER)).rejects.toThrow(ForbiddenException);
  expect(mockCacheService.del).not.toHaveBeenCalled();
 });

 it('deve lançar BadRequestException se apenas uma coordenada for fornecida', async () => {
  mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

  await expect(useCase.execute(mockId, { latitude: -23 }, 'user-1', UserRole.USER)).rejects.toThrow(BadRequestException);
 });
});