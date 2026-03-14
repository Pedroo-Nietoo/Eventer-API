import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ValidatedUser } from '../types/validated-user.type';
import { LoginResponseDto } from '../dto/login-response.dto';

@Injectable()
export class LoginUseCase {
 constructor(private readonly jwtService: JwtService) { }

 async execute(user: ValidatedUser): Promise<LoginResponseDto> {
  const payload = { sub: user.id, role: user.role };

  return {
   access_token: this.jwtService.sign(payload),
  };
 }
}