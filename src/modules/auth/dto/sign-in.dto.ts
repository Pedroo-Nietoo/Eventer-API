import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for signing in.
 */
export class SignInDto {
  /**
   * The email of the user.
   * @type {string}
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * The password of the user.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
