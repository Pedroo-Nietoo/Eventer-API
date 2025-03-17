import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/**
 * Service responsible for handling authentication-related operations.
 */
@Injectable()
export class AuthService {
  /**
   * Constructs an instance of AuthService.
   * @param usersService - The service used to interact with user data.
   * @param jwtService - The service used to handle JSON Web Tokens.
   */
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Signs in a user with the provided email and password.
   * @param email - The email of the user attempting to sign in.
   * @param pass - The password of the user attempting to sign in.
   * @returns A promise that resolves to an object containing the access token.
   * @throws UnauthorizedException if the password is invalid.
   */
  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
