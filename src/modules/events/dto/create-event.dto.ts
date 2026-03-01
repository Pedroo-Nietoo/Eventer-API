import { IsString, IsNumber } from 'class-validator';

export class CreateEventDto {
 @IsString()
 title: string;

 @IsString()
 description: string;

 @IsString()
 coverImageUrl: string;

 @IsNumber()
 latitude: number;

 @IsNumber()
 longitude: number;
}