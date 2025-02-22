import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(email);

    const isValidPassword = await bcrypt.compare(pass, user?.user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.user.id,
      name: user.user.name,
      email: user.user.email,
      birthDate: user.user.birthDate,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
