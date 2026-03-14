import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseRepository } from 'src/common/repository/base.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
 constructor(
  @InjectRepository(User)
  private readonly usersRepo: Repository<User>,
 ) {
  super(usersRepo);
 }

 async findByEmail(email: string): Promise<User | null> {
  return this.usersRepo.findOne({
   where: { email },
   select: {
    id: true,
    email: true,
    password: true,
    role: true,
   },
  });
 }
}