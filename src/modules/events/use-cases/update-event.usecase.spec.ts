import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEventUseCase } from './update-event.usecase';
import { EventsRepository } from '@events/repository/events.repository';
import { EventMapper } from '@events/mappers/event.mapper';
import { UserRole } from '@common/enums/role.enum';
import {
 NotFoundException,
 ForbiddenException,
 BadRequestException,
 ConflictException,
 InternalServerErrorException,
 Logger
} from '@nestjs/common';
import * as generateSlugHelper from '@common/utils/generate-slug';


jest.mock('@common/utils/generate-slug', () => ({
 __esModule: true,
 default: jest.fn((val: string) => val.toLowerCase().replaceAll(/ /g, '-')),
}));

describe('UpdateEventUseCase', () => {
 let useCase: UpdateEventUseCase;
 let eventsRepository: EventsRepository;

 const mockEventsRepository = {
  findById: jest.fn(),
  save: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    UpdateEventUseCase,
    {
     provide: EventsRepository,
     useValue: mockEventsRepository,
    },
   ],
  }).compile();

  useCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
  eventsRepository = module.get<EventsRepository>(EventsRepository);

  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const mockId = 'evt-123';
  const mockUserId = 'user-1';
  const mockEvent = {
   id: mockId,
   organizerId: mockUserId,
   title: 'Original Title',
   slug: 'original-title',
  } as any;

  it('deve atualizar o evento com sucesso se o usuário for o dono', async () => {
   const dto = { title: 'New Title', latitude: -23, longitude: -46 };
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.save.mockImplementationOnce((val) => Promise.resolve(val));

   const mapperSpy = jest.spyOn(EventMapper, 'toResponse').mockReturnValue({} as any);

   await useCase.execute(mockId, dto, mockUserId, UserRole.USER);

   expect(mockEventsRepository.save).toHaveBeenCalledWith(expect.objectContaining({
    title: 'New Title',
    location: {
     type: 'Point',
     coordinates: [-46, -23],
    },
   }));
   expect(mapperSpy).toHaveBeenCalled();
  });

  it('deve atualizar o evento com sucesso se o usuário for ADMIN', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.save.mockImplementationOnce((val) => Promise.resolve(val));

   await useCase.execute(mockId, { title: 'Admin Edit' }, 'admin-id', UserRole.ADMIN);

   expect(mockEventsRepository.save).toHaveBeenCalled();
  });

  it('deve lançar ForbiddenException se não for dono nem ADMIN', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

   await expect(
    useCase.execute(mockId, { title: 'Hack' }, 'wrong-user', UserRole.USER)
   ).rejects.toThrow(ForbiddenException);
  });

  it('deve retornar o evento original se o DTO for vazio', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   const mapperSpy = jest.spyOn(EventMapper, 'toResponse');

   await useCase.execute(mockId, {}, mockUserId, UserRole.USER);

   expect(mockEventsRepository.save).not.toHaveBeenCalled();
   expect(mapperSpy).toHaveBeenCalledWith(mockEvent);
  });

  it('deve lançar BadRequestException se apenas uma coordenada for fornecida', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);

   await expect(
    useCase.execute(mockId, { latitude: -23 }, mockUserId, UserRole.USER)
   ).rejects.toThrow(BadRequestException);
  });

  it('deve processar o slug se fornecido no DTO', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.save.mockImplementationOnce((val) => Promise.resolve(val));

   const dto = { slug: 'Novo Slug' };
   await useCase.execute(mockId, dto, mockUserId, UserRole.USER);

   expect(generateSlugHelper.default).toHaveBeenCalledWith('Novo Slug');
  });

  it('deve lançar ConflictException em caso de slug duplicado no banco', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   const dbError = { code: '23505' };
   mockEventsRepository.save.mockRejectedValueOnce(dbError);

   await expect(
    useCase.execute(mockId, { title: 'Duplicate' }, mockUserId, UserRole.USER)
   ).rejects.toThrow(ConflictException);
  });

  it('deve lançar InternalServerErrorException em erros genéricos', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(mockEvent);
   mockEventsRepository.save.mockRejectedValueOnce(new Error('Fatal'));

   await expect(
    useCase.execute(mockId, { title: 'Error' }, mockUserId, UserRole.USER)
   ).rejects.toThrow(InternalServerErrorException);
  });

  it('deve lançar NotFoundException se o evento não existir', async () => {
   mockEventsRepository.findById.mockResolvedValueOnce(null);

   await expect(
    useCase.execute(mockId, { title: 'Any' }, mockUserId, UserRole.USER)
   ).rejects.toThrow(NotFoundException);
  });
 });
});