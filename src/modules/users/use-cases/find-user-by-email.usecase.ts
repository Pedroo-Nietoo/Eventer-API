import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repository/users.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class FindUserByEmailUseCase {
 constructor(
  private readonly usersRepository: UsersRepository,
 ) { }

 async execute(email: string): Promise<User | null> {
  return this.usersRepository.findByEmailWithPassword(email);
 }
}