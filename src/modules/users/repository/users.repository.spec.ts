import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from '@users/entities/user.entity';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let typeormRepo: Repository<User>;


  const mockQueryBuilder = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };


  const mockTypeORMRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),


  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeORMRepo,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    typeormRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmailWithPassword', () => {
    it('deve buscar um usuário pelo e-mail e incluir o campo password', async () => {

      const email = 'pedro@test.com';
      const mockUserWithPassword = {
        id: 'uuid-123',
        email,
        password: 'hashed_password_abc',
      } as User;

      mockQueryBuilder.getOne.mockResolvedValueOnce(mockUserWithPassword);


      const result = await repository.findByEmailWithPassword(email);


      expect(typeormRepo.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email });
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockUserWithPassword);
    });

    it('deve retornar null se nenhum usuário for encontrado com o e-mail', async () => {

      const email = 'notfound@test.com';
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);


      const result = await repository.findByEmailWithPassword(email);


      expect(result).toBeNull();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email });
    });
  });
});