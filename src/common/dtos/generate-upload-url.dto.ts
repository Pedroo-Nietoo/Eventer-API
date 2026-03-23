import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GenerateUploadUrlDto {
 @IsString()
 @IsNotEmpty({ message: 'O nome do arquivo (fileName) é obrigatório' })
 fileName: string;

 @IsString()
 @IsNotEmpty({ message: 'O contentType é obrigatório' })
 contentType: string;

 @IsString()
 @IsIn(['users', 'events'], { message: 'O folder deve ser users ou events' })
 folder: 'users' | 'events';
}