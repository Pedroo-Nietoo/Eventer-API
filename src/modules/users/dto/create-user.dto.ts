import {
 IsString,
 IsEmail,
 IsNotEmpty,
 MinLength,
 MaxLength,
 IsOptional,
 IsUrl,
 IsEnum
} from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class CreateUserDto {
 @MaxLength(100, { message: "O campo 'username' pode ter no máximo 100 caracteres." })
 @MinLength(3, { message: "O campo 'username' deve ter pelo menos 3 caracteres." })
 @IsString({ message: "O campo 'username' deve ser uma string." })
 @IsNotEmpty({ message: "O campo 'username' é obrigatório." })
 username: string;

 @IsEmail({}, { message: "Por favor, insira um endereço de e-mail válido." })
 @IsNotEmpty({ message: "O campo 'email' é obrigatório." })
 email: string;

 @MinLength(6, { message: "A senha deve conter no mínimo 6 caracteres." })
 @IsString({ message: "A senha deve ser uma string." })
 @IsNotEmpty({ message: "O campo 'password' é obrigatório." })
 password: string;

 @IsOptional()
 @IsUrl({}, { message: "A foto de perfil deve ser uma URL válida." })
 profilePicture?: string;

 @IsOptional()
 @IsEnum(UserRole, { message: "A role do usuário é inválida." })
 role?: UserRole;
}