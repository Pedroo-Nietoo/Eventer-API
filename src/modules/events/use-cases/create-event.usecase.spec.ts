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

describe('CreateEventUseCase', () => {
 let useCase: CreateEventUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  create: jest.fn(),
  save: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateEventUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<CreateEventUseCase>(CreateEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
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
   coverImageUrl: 'https://example.com/cover.jpg'
  } as any;

  it('deve criar um evento com sucesso, gerando o slug e o objeto de localização', async () => {
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

   expect(generateSlug).toHaveBeenCalledWith(mockDto.title);
   expect(createId).toHaveBeenCalledTimes(1);

   expect(mockEventsRepository.create).toHaveBeenCalledWith({
    ...mockDto,
    slug: expectedSlug,
    organizerId: mockOrganizerId,
    location: {
     type: 'Point',
     coordinates: [mockDto.longitude, mockDto.latitude],
    },
   });

   expect(mockEventsRepository.save).toHaveBeenCalledWith(mockCreatedEventEntity);
   expect(mapperSpy).toHaveBeenCalledWith(mockCreatedEventEntity);
   expect(result).toEqual(mockResponseDto);
  });

  it('deve lançar ConflictException se o banco de dados retornar erro de duplicidade (23505/ER_DUP_ENTRY)', async () => {
   const dbError = new Error('Duplicate key value violates unique constraint') as any;
   dbError.code = '23505';

   mockEventsRepository.save.mockRejectedValueOnce(dbError);
   await expect(useCase.execute(mockDto, mockOrganizerId)).rejects.toThrow(
    new ConflictException('O slug deste evento já existe.')
   );

   expect(Logger.prototype.error).not.toHaveBeenCalled();
  });

  it('deve lançar InternalServerErrorException e registrar o log se houver erro genérico no banco', async () => {
   const dbError = new Error('Connection timeout') as any;
   dbError.code = '57P01';

   mockEventsRepository.save.mockRejectedValueOnce(dbError);

   const loggerSpy = jest.spyOn(Logger.prototype, 'error');
   await expect(useCase.execute(mockDto, mockOrganizerId)).rejects.toThrow(
    new InternalServerErrorException('Erro interno ao criar evento.')
   );

   expect(loggerSpy).toHaveBeenCalledWith('Erro ao criar evento', dbError);
  });
 });
});