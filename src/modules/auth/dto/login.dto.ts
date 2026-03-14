import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
 @ApiProperty({
  example: 'john@example.com',
  description: 'E-mail cadastrado do usuário'
 })
 @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
 @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
 email: string;

 @ApiProperty({
  example: 'senha123',
  description: 'Senha do usuário (mínimo 6 caracteres)',
  minLength: 6
 })
 @IsString({ message: 'A senha deve ser uma string.' })
 @IsNotEmpty({ message: 'A senha é obrigatória.' })
 @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
 password: string;
}