import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.usecase';
import { UsersRepository } from '@users/repository/users.repository';
import { UserMapper } from '@users/mappers/user.mapper';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let usersRepository: UsersRepository;

  const mockUsersRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      username: 'pedro_original',
      email: 'pedro@original.com',
      password: 'old_hashed_password',
    };

    it('deve atualizar o usuário com sucesso (sem senha)', async () => {
      const updateDto = { username: 'pedro_novo' };
      mockUsersRepository.findById.mockResolvedValueOnce({ ...mockUser });
      mockUsersRepository.save.mockImplementationOnce((val) => Promise.resolve(val));

      const mapperSpy = jest.spyOn(UserMapper, 'toResponse');

      await useCase.execute(userId, updateDto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'pedro_novo',
          email: 'pedro@original.com',
        }),
      );
      expect(mapperSpy).toHaveBeenCalled();
    });

    it('deve realizar o hash da nova senha quando fornecida', async () => {
      const updateDto = { password: 'new_password_123' };
      const newHash = 'new_hashed_abc';

      mockUsersRepository.findById.mockResolvedValueOnce({ ...mockUser });
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(newHash);
      mockUsersRepository.save.mockImplementationOnce((val) => Promise.resolve(val));

      await useCase.execute(userId, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('new_password_123', 10);
      expect(mockUsersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: newHash }),
      );
    });

    it('deve retornar o usuário sem alterações se o DTO for vazio', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce({ ...mockUser });

      const result = await useCase.execute(userId, {});

      expect(mockUsersRepository.save).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deve retornar o usuário sem alterações se o DTO for nulo', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce({ ...mockUser });

      const result = await useCase.execute(userId, null as any);

      expect(mockUsersRepository.save).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('deve lançar ConflictException para códigos de erro de duplicidade (Postgres e MySQL)', async () => {
      mockUsersRepository.findById.mockResolvedValue({ ...mockUser });

      const pgError = { code: '23505' };
      const mysqlError = { code: 'ER_DUP_ENTRY' };

      mockUsersRepository.save.mockRejectedValueOnce(pgError);
      await expect(useCase.execute(userId, { email: 'dup@test.com' }))
        .rejects.toThrow(ConflictException);

      mockUsersRepository.save.mockRejectedValueOnce(mysqlError);
      await expect(useCase.execute(userId, { email: 'dup@test.com' }))
        .rejects.toThrow(ConflictException);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce(null);

      await expect(useCase.execute(userId, { username: 'teste' })).rejects.toThrow(
        new NotFoundException(`Usuário com o ID ${userId} não encontrado.`),
      );
    });

    it('deve lançar InternalServerErrorException e logar mensagem padrão se não houver stack trace', async () => {
      mockUsersRepository.findById.mockResolvedValueOnce({ ...mockUser });

      const genericError = { code: 'OTHER_ERROR' };
      mockUsersRepository.save.mockRejectedValueOnce(genericError);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(useCase.execute(userId, { username: 'erro' }))
        .rejects.toThrow(InternalServerErrorException);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro ao atualizar usuário ID=${userId}`),
        'Sem stack trace',
      );
    });
  });
});