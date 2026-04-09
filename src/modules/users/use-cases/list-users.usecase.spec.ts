import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import { PaginationDto } from '@common/dtos/pagination.dto';

describe('ListUsersUseCase', () => {
 let useCase: ListUsersUseCase;
 let usersRepository: UsersRepository;

 const mockUsersRepository = {
  findAndCount: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    ListUsersUseCase,
    {
     provide: UsersRepository,
     useValue: mockUsersRepository,
    },
   ],
  }).compile();

  useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
  usersRepository = module.get<UsersRepository>(UsersRepository);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 it('deve estar definido', () => {
  expect(useCase).toBeDefined();
 });

 describe('execute', () => {
  const mockUsers = [
   { id: '1', username: 'user1', email: 'u1@test.com' },
   { id: '2', username: 'user2', email: 'u2@test.com' },
  ];

  const mockResponseList = [
   { id: '1', username: 'user1' },
   { id: '2', username: 'user2' },
  ];

  it('deve retornar lista de usuários paginada com metadados corretos', async () => {

   const paginationDto: PaginationDto = { page: 2, limit: 10 };
   const totalItems = 25;

   mockUsersRepository.findAndCount.mockResolvedValueOnce([mockUsers, totalItems]);
   const mapperSpy = jest.spyOn(UserMapper, 'toResponseList').mockReturnValue(mockResponseList as any);


   const result = await useCase.execute(paginationDto);



   expect(mockUsersRepository.findAndCount).toHaveBeenCalledWith({
    skip: 10,
    take: 10,
    order: { createdAt: 'DESC' },
   });

   expect(mapperSpy).toHaveBeenCalledWith(mockUsers);
   expect(result.data).toEqual(mockResponseList);
   expect(result.meta).toEqual({
    totalItems: 25,
    itemCount: 2,
    itemsPerPage: 10,
    totalPages: 3,
    currentPage: 2,
   });
  });

  it('deve aplicar valores padrão quando paginationDto for vazio', async () => {

   mockUsersRepository.findAndCount.mockResolvedValueOnce([[], 0]);


   await useCase.execute({});


   expect(mockUsersRepository.findAndCount).toHaveBeenCalledWith(
    expect.objectContaining({
     skip: 0,
     take: 20,
    }),
   );
  });

  it('deve propagar erros do repositório', async () => {

   mockUsersRepository.findAndCount.mockRejectedValueOnce(new Error('DB Error'));


   await expect(useCase.execute({})).rejects.toThrow('DB Error');
  });
 });
});