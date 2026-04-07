import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidateUserUseCase } from '@auth/use-cases/validate-user.usecase';
import { ValidatedUser } from '@auth/types/validated-user.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
 constructor(private readonly validateUserUseCase: ValidateUserUseCase) {
  super({ usernameField: 'email' });
 }

 async validate(email: string, pass: string): Promise<ValidatedUser> {
  const user = await this.validateUserUseCase.execute(email, pass);

  if (!user) {
   throw new UnauthorizedException('E-mail ou senha incorretos.');
  }

  return user;
 }
}