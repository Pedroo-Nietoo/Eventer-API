import { Test, TestingModule } from '@nestjs/testing';
import { CreateEventUseCase } from './create-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { EventMapper } from '@events/mappers/event.mapper';
import { CreateEventDto } from '@events/dto/create-event.dto';

jest.mock('@paralleldrive/cuid2', () => ({
 createId: jest.fn(),
}));

jest.mock('@common/utils/generate-slug', () => ({
 __esModule: true,
 default: jest.fn(),
}));

import { createId } from '@paralleldrive/cuid2';
import generateSlug from '@common/utils/generate-slug';
import { CacheService } from '@infra/redis/services/cache.service';

describe('CreateEventUseCase', () => {
 let useCase: CreateEventUseCase;
 let eventsRepository: EventsRepository;
 let cacheService: CacheService;

 const mockEventsRepository = {
  create: jest.fn(),
  save: jest.fn(),
 };

 const mockCacheService = {
  delByPattern: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateEventUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
    {
     provide: CacheService,
     useValue: mockCacheService,
    },
   ],
  }).compile();

  useCase = module.get<CreateEventUseCase>(CreateEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);
  cacheService = module.get<CacheService>(CacheService);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockOrganizerId = 'org-uuid-123';
  const mockDto: CreateEventDto = {
   title: 'Festival de Música 2026',
   description: 'Um grande festival.',
   latitude: -23.5505,
   longitude: -46.6333,
   eventDate: new Date('2026-12-31T20:00:00Z'),
   coverImageUrl: 'https://example.com/cover.jpg',
  } as any;

  it('deve criar um evento com sucesso, limpar o cache das listas e retornar o DTO', async () => {
   const mockSlugBase = 'festival-de-musica-2026';
   const mockCuid = 'cuid987654321';
   const expectedSlug = `${mockSlugBase}-${mockCuid}`;

   (generateSlug as jest.Mock).mockReturnValue(mockSlugBase);
   (createId as jest.Mock).mockReturnValue(mockCuid);

   const mockCreatedEventEntity = { id: 'evt-1', ...mockDto, slug: expectedSlug };
   mockEventsRepository.create.mockReturnValue(mockCreatedEventEntity);
   mockEventsRepository.save.mockResolvedValue(mockCreatedEventEntity);

   const mockResponseDto = { id: 'evt-1', title: mockDto.title };
   const mapperSpy = jest.spyOn(EventMapper, 'toResponse').mockReturnValue(mockResponseDto as any);

   const result = await useCase.execute(mockDto, mockOrganizerId);

   expect(mockEventsRepository.save).toHaveBeenCalledWith(mockCreatedEventEntity);
   expect(mockCacheService.delByPattern).toHaveBeenCalledWith('events:list:*');
   expect(mapperSpy).toHaveBeenCalledWith(mockCreatedEventEntity);
   expect(result).toEqual(mockResponseDto);
  });

  it('deve lançar ConflictException se o banco retornar erro de duplicidade', async () => {
   const dbError = new Error('Duplicate key') as any;
   dbError.code = '23505';

   mockEventsRepository.save.mockRejectedValueOnce(dbError);

   await expect(useCase.execute(mockDto, mockOrganizerId)).rejects.toThrow(ConflictException);
   expect(mockCacheService.delByPattern).not.toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException e registrar o log se houver erro genérico no banco', async () => {
   const dbError = new Error('Connection timeout') as any;
   dbError.code = '57P01';

   mockEventsRepository.save.mockRejectedValueOnce(dbError);

   const loggerSpy = jest.spyOn(Logger.prototype, 'error');
   await expect(useCase.execute(mockDto, mockOrganizerId)).rejects.toThrow(InternalServerErrorException);

   expect(loggerSpy).toHaveBeenCalledWith('Erro ao criar evento', dbError);
   expect(mockCacheService.delByPattern).not.toHaveBeenCalled();
  });
 });
});