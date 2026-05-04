import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: 'REDIS',
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('deve retornar o dado com parse de JSON se a chave existir', async () => {
      const mockData = { id: 1, name: 'Teste' };
      mockRedis.get.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await service.get('minha-chave');

      expect(mockRedis.get).toHaveBeenCalledWith('minha-chave');
      expect(result).toEqual(mockData);
    });

    it('deve retornar null se a chave não existir', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await service.get('chave-inexistente');

      expect(mockRedis.get).toHaveBeenCalledWith('chave-inexistente');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('deve salvar o valor no Redis com stringify e TTL (EX)', async () => {
      const value = { evento: 'Festa' };
      const ttl = 300;

      await service.set('nova-chave', value, ttl);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'nova-chave',
        JSON.stringify(value),
        'EX',
        ttl,
      );
    });
  });

  describe('del', () => {
    it('deve deletar uma chave única passada como string', async () => {
      await service.del('chave-1');
      expect(mockRedis.del).toHaveBeenCalledWith('chave-1');
    });

    it('deve deletar múltiplas chaves se um array for passado', async () => {
      await service.del(['chave-1', 'chave-2']);
      expect(mockRedis.del).toHaveBeenCalledWith('chave-1', 'chave-2');
    });

    it('não deve chamar a função del do Redis se o array for vazio', async () => {
      await service.del([]);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe('delByPattern', () => {
    it('deve buscar as chaves pelo padrão e deletá-las se encontrar alguma', async () => {
      const mockKeys = ['events:list:1:20', 'events:list:2:20'];
      mockRedis.keys.mockResolvedValueOnce(mockKeys);

      await service.delByPattern('events:list:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('events:list:*');
      expect(mockRedis.del).toHaveBeenCalledWith(...mockKeys);
    });

    it('não deve chamar a função del do Redis se nenhuma chave bater com o padrão', async () => {
      mockRedis.keys.mockResolvedValueOnce([]);

      await service.delByPattern('events:list:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('events:list:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });
});