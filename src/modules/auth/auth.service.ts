import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * Service for authentication operations.
 *
 * @class
 */
@Injectable()
export class AuthService {
  /**
   * Constructs an instance of AuthService.
   *
   * @param usersService - The service used to manage user data.
   * @param jwtService - The service used to handle JSON Web Tokens.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials.
   * @param email - The email of the user.
   * @param pass - The password provided by the user.
   * @returns The user object if credentials are valid; otherwise, null.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return null;
    }

    const validUser = await bcrypt.compare(pass, user.password);

    if (validUser) {
      return user;
    }

    return null;
  }

  /**
   * Logs in a user and generates a JWT token.
   * @param user - The user object to be included in the JWT payload.
   * @returns The generated JWT tokens.
   */
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if(!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthDate: user.birthDate,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes the access token using the provided refresh token.
   *
   * @param {string} refreshToken - The refresh token to decode and use for generating a new access token.
   * @returns {Promise<{ accessToken: string, refreshToken: string }>} An object containing the new access token and the provided refresh token.
   * @throws {UnauthorizedException} If the refresh token is invalid.
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.decode(refreshToken);

      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          birthDate: payload.birthDate,
        },
        {
          expiresIn: '1h',
        },
      );

      return {
        accessToken: newAccessToken,
        refreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}