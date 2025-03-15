import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Role } from '@prisma/client';
/**
 * Data Transfer Object for creating a user.
 */
export class CreateUserDto {
  /**
   * The name of the user.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  name: string;

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

  /**
   * The birth date of the user.
   * @type {Date}
   */
  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;

  /**
   * The role of the user.
   * @type {Role}
   */
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
