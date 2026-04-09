import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

class DummyEntity {
 id: string;
 name: string;
}

class DummyRepository extends BaseRepository<DummyEntity> {
 constructor(repo: Repository<DummyEntity>) {
  super(repo);
 }
}

describe('BaseRepository', () => {
 let repository: DummyRepository;
 let mockTypeORMRepo: jest.Mocked<Partial<Repository<DummyEntity>>>;

 beforeEach(() => {
  mockTypeORMRepo = {
   create: jest.fn(),
   save: jest.fn(),
   findOne: jest.fn(),
   find: jest.fn(),
   findAndCount: jest.fn(),
   count: jest.fn(),
   delete: jest.fn(),
   softDelete: jest.fn(),
  };

  repository = new DummyRepository(mockTypeORMRepo as Repository<DummyEntity>);
 });

 afterEach(() => {
  jest.clearAllMocks();
 });

 describe('create', () => {
  it('deve chamar o método create do TypeORM', () => {
   const dto = { name: 'Teste' };
   const createdEntity = { id: '1', name: 'Teste' } as DummyEntity;

   (mockTypeORMRepo.create as jest.Mock).mockReturnValue(createdEntity);

   const result = repository.create(dto);

   expect(mockTypeORMRepo.create).toHaveBeenCalledWith(dto);
   expect(result).toEqual(createdEntity);
  });
 });

 describe('save', () => {
  it('deve chamar o método save do TypeORM', async () => {
   const entity = { id: '1', name: 'Teste' } as DummyEntity;
   (mockTypeORMRepo.save as jest.Mock).mockResolvedValue(entity);

   const result = await repository.save(entity);

   expect(mockTypeORMRepo.save).toHaveBeenCalledWith(entity);
   expect(result).toEqual(entity);
  });
 });

 describe('findById', () => {
  it('deve chamar o findOne do TypeORM com o ID correto', async () => {
   const id = 'uuid-123';
   const entity = { id, name: 'Teste' } as DummyEntity;
   (mockTypeORMRepo.findOne as jest.Mock).mockResolvedValue(entity);

   const result = await repository.findById(id);

   expect(mockTypeORMRepo.findOne).toHaveBeenCalledWith({ where: { id } });
   expect(result).toEqual(entity);
  });
 });

 describe('findAll', () => {
  it('deve chamar o find do TypeORM aplicando paginação padrão', async () => {
   const entities = [{ id: '1', name: 'Teste' }] as DummyEntity[];
   (mockTypeORMRepo.find as jest.Mock).mockResolvedValue(entities);

   const result = await repository.findAll();

   expect(mockTypeORMRepo.find).toHaveBeenCalledWith({ skip: 0, take: 20 });
   expect(result).toEqual(entities);
  });

  it('deve chamar o find com valores customizados', async () => {
   await repository.findAll(10, 50);
   expect(mockTypeORMRepo.find).toHaveBeenCalledWith({ skip: 10, take: 50 });
  });
 });

 describe('findAndCount', () => {
  it('deve repassar as opções para o findAndCount do TypeORM', async () => {
   const options = { where: { name: 'Teste' } };
   const mockResult = [[{ id: '1', name: 'Teste' }], 1] as [DummyEntity[], number];

   (mockTypeORMRepo.findAndCount as jest.Mock).mockResolvedValue(mockResult);

   const result = await repository.findAndCount(options);

   expect(mockTypeORMRepo.findAndCount).toHaveBeenCalledWith(options);
   expect(result).toEqual(mockResult);
  });
 });

 describe('count', () => {
  it('deve retornar o total de registros', async () => {
   (mockTypeORMRepo.count as jest.Mock).mockResolvedValue(42);

   const result = await repository.count();

   expect(mockTypeORMRepo.count).toHaveBeenCalled();
   expect(result).toBe(42);
  });
 });

 describe('delete', () => {
  it('deve repassar o ID para o método delete do TypeORM', async () => {
   const id = '123';
   await repository.delete(id);
   expect(mockTypeORMRepo.delete).toHaveBeenCalledWith(id);
  });
 });

 describe('softDelete', () => {
  it('deve repassar o ID para o método softDelete do TypeORM', async () => {
   const id = '456';
   await repository.softDelete(id);
   expect(mockTypeORMRepo.softDelete).toHaveBeenCalledWith(id);
  });
 });
});