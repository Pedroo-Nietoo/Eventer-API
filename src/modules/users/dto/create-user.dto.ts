import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { UserRole } from '@common/enums/role.enum';

export class CreateUserDto {
 @ApiProperty({ example: 'johndoe', description: 'Nome único de usuário' })
 @MaxLength(100) @MinLength(3) @IsString() @IsNotEmpty()
 username: string;

 @ApiProperty({ example: 'john@example.com', description: 'E-mail para login e notificações' })
 @IsEmail() @IsNotEmpty()
 @Transform(({ value }) => value?.toLowerCase().trim())
 email: string;

 @ApiProperty({ example: 'senha123', description: 'Senha do usuário (mínimo 6 caracteres)', minLength: 6 })
 @MinLength(6) @IsString() @IsNotEmpty()
 password: string;

 @ApiPropertyOptional({ example: 'https://avatar.com/user.png', description: 'URL da foto de perfil' })
 @IsOptional() @IsUrl()
 profilePicture?: string;

 @IsOptional() @IsEnum(UserRole)
 role?: UserRole;
}