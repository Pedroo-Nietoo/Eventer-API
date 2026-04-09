import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '@tickets/entities/ticket.entity';
import { TicketsRepository } from './ticket.repository';

describe('TicketsRepository', () => {
 let repository: TicketsRepository;
 let typeormRepo: Repository<Ticket>;


 const mockTypeORMRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
 };


 const expectedRelations = {
  user: true,
  ticketType: {
   event: true,
  },
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    TicketsRepository,
    {
     provide: getRepositoryToken(Ticket),
     useValue: mockTypeORMRepo,
    },
   ],
  }).compile();

  repository = module.get<TicketsRepository>(TicketsRepository);
  typeormRepo = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(repository).toBeDefined();
 });

 describe('findByIdWithRelations', () => {
  it('deve buscar um ingresso pelo ID incluindo as relações corretas', async () => {

   const ticketId = 'ticket-123';
   const mockTicket = { id: ticketId } as Ticket;
   mockTypeORMRepo.findOne.mockResolvedValueOnce(mockTicket);


   const result = await repository.findByIdWithRelations(ticketId);


   expect(typeormRepo.findOne).toHaveBeenCalledWith({
    where: { id: ticketId },
    relations: expectedRelations,
   });
   expect(result).toEqual(mockTicket);
  });

  it('deve retornar null se o ingresso não for encontrado', async () => {
   mockTypeORMRepo.findOne.mockResolvedValueOnce(null);
   const result = await repository.findByIdWithRelations('inexistente');
   expect(result).toBeNull();
  });
 });

 describe('findAllWithRelations', () => {
  it('deve buscar ingressos paginados incluindo as relações e ordenação', async () => {

   const skip = 10;
   const take = 20;
   const mockResult = [[{ id: 'ticket-1' }], 1] as [Ticket[], number];

   mockTypeORMRepo.findAndCount.mockResolvedValueOnce(mockResult);


   const result = await repository.findAllWithRelations(skip, take);


   expect(typeormRepo.findAndCount).toHaveBeenCalledWith({
    relations: expectedRelations,
    skip,
    take,
    order: {
     createdAt: 'DESC',
    },
   });
   expect(result).toEqual(mockResult);
  });
 });

 describe('findByQrCodeWithRelations', () => {
  it('deve buscar um ingresso pelo QR Code incluindo as relações corretas', async () => {

   const qrCodeToken = 'token-secreto-xyz';
   const mockTicket = { id: 'ticket-2', qrCode: qrCodeToken } as Ticket;
   mockTypeORMRepo.findOne.mockResolvedValueOnce(mockTicket);


   const result = await repository.findByQrCodeWithRelations(qrCodeToken);


   expect(typeormRepo.findOne).toHaveBeenCalledWith({
    where: { qrCode: qrCodeToken },
    relations: expectedRelations,
   });
   expect(result).toEqual(mockTicket);
  });
 });
});