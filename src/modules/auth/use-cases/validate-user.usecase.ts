import { ValidatedUser } from '@auth/types/validated-user.type';
import { Injectable } from '@nestjs/common';
import { FindUserByEmailUseCase } from '@users/use-cases/find-user-by-email.usecase';
import * as bcrypt from 'bcrypt';

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