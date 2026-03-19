import { Repository, FindOptionsWhere, DeepPartial, FindManyOptions } from 'typeorm';

export abstract class BaseRepository<T extends { id: string }> {
 constructor(protected readonly repository: Repository<T>) { }

 create(data: DeepPartial<T>): T {
  return this.repository.create(data);
 }

 async save(entity: T): Promise<T> {
  return this.repository.save(entity);
 }

 async findById(id: string): Promise<T | null> {
  return this.repository.findOne({
   where: { id } as FindOptionsWhere<T>,
  });
 }

 async findAll(skip = 0, take = 20): Promise<T[]> {
  return this.repository.find({
   skip,
   take,
  });
 }

 async findAndCount(options: FindManyOptions<T>): Promise<[T[], number]> {
  return this.repository.findAndCount(options);
 }

 async count(): Promise<number> {
  return this.repository.count();
 }

 async delete(id: string) {
  return this.repository.delete(id);
 }

 async softDelete(id: string) {
  return this.repository.softDelete(id);
 }
}