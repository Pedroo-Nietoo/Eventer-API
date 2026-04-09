import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import { UserRole } from '@common/enums/role.enum';
import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


jest.mock('bcrypt');

describe('CreateUserUseCase', () => {
 let useCase: CreateUserUseCase;
 let usersRepository: UsersRepository;

 const mockUsersRepository = {
  create: jest.fn(),
  save: jest.fn(),
 };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
   providers: [
    CreateUserUseCase,
    {
     provide: UsersRepository,
     useValue: mockUsersRepository,
    },
   ],
  }).compile();

  useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  usersRepository = module.get<UsersRepository>(UsersRepository);


  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('execute', () => {
  const createUserDto = {
   username: 'pedronieto',
   email: 'pedro@test.com',
   password: 'password123',
  };

  const mockHashedPassword = 'hashed_password_abc';

  it('deve criar um usuário com sucesso e retornar o DTO mapeado', async () => {

   const savedUser = { ...createUserDto, id: 'uuid-123', role: UserRole.USER, password: mockHashedPassword };
   const responseDto = { id: 'uuid-123', username: 'pedronieto', email: 'pedro@test.com' };

   (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
   mockUsersRepository.create.mockReturnValue(savedUser);
   mockUsersRepository.save.mockResolvedValue(savedUser);

   const mapperSpy = jest.spyOn(UserMapper, 'toResponse').mockReturnValue(responseDto as any);


   const result = await useCase.execute(createUserDto as any);


   expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
   expect(mockUsersRepository.create).toHaveBeenCalledWith(expect.objectContaining({
    password: mockHashedPassword,
    role: UserRole.USER
   }));
   expect(mockUsersRepository.save).toHaveBeenCalled();
   expect(mapperSpy).toHaveBeenCalledWith(savedUser);
   expect(result).toEqual(responseDto);
  });

  it('deve atribuir uma role específica se informada no DTO', async () => {

   const dtoWithRole = { ...createUserDto, role: UserRole.ADMIN };
   (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
   mockUsersRepository.create.mockReturnValue({});
   mockUsersRepository.save.mockResolvedValue({});


   await useCase.execute(dtoWithRole as any);


   expect(mockUsersRepository.create).toHaveBeenCalledWith(expect.objectContaining({
    role: UserRole.ADMIN
   }));
  });

  it('deve lançar ConflictException quando o e-mail já estiver em uso (Código 23505)', async () => {

   (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
   const dbError = { code: '23505' };
   mockUsersRepository.save.mockRejectedValue(dbError);


   await expect(useCase.execute(createUserDto as any)).rejects.toThrow(
    new ConflictException('Este e-mail já está em uso.')
   );
  });

  it('deve lançar InternalServerErrorException em caso de erro desconhecido no banco', async () => {

   (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
   mockUsersRepository.save.mockRejectedValue(new Error('Generic DB Error'));


   await expect(useCase.execute(createUserDto as any)).rejects.toThrow(
    new InternalServerErrorException('Erro interno ao tentar criar o usuário.')
   );
  });
 });
});