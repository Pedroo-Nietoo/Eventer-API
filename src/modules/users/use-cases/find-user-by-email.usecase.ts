import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@users/repository/users.repository';
import { User } from '@users/entities/user.entity';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }
}
