import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  // 1. Valida se o usuário existe e se a senha bate
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && await bcrypt.compare(pass, user.password)) {
      // Removemos a senha do objeto antes de devolvê-lo para a Strategy
      const { password, ...result } = user;
      return result;
    }
    // Se não bater, retornamos null (o Passport entende isso como erro)
    return null;
  }

  // 2. Gera o Token JWT
  async login(user: any) {
    // O payload é o conteúdo que vai dentro do Token.
    // Dica de segurança: Não coloque dados sensíveis (como e-mail) se não for estritamente necessário
    const payload = { sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}