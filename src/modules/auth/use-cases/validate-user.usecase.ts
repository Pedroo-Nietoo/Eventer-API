import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FindUserByEmailUseCase } from '../../users/use-cases/find-user-by-email.usecase';
import { User } from 'src/modules/users/entities/user.entity';
import { ValidatedUser } from '../types/validated-user.type';

@Injectable()
export class ValidateUserUseCase {
 constructor(
  private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
 ) { }

 async execute(email: string, pass: string): Promise<ValidatedUser | null> {
  const user = await this.findUserByEmailUseCase.execute(email);

  if (user && await bcrypt.compare(pass, user.password)) {
   const { password, ...result } = user;
   return result;
  }

  return null;
 }
}