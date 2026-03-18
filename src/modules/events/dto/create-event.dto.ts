import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate, IsDateString } from 'class-validator';

export class CreateEventDto {
 @ApiProperty({ example: 'Show da Virada 2026' })
 @IsString()
 title: string;

 @ApiPropertyOptional({ example: 'show-da-virada' })
 @IsString()
 @IsOptional()
 slug?: string;

 @ApiProperty({ example: 'O maior evento do ano!' })
 @IsString()
 description: string;

 @ApiProperty({ example: 'https://imagem.com/capa.png' })
 @IsString()
 coverImageUrl: string;

 @ApiProperty({ example: '2026-12-31T21:00:00Z' })
 @IsString()
 @IsDateString()
 eventDate: Date;

 @ApiProperty({ example: -23.55052 })
 @IsNumber()
 latitude: number;

 @ApiProperty({ example: -46.633308 })
 @IsNumber()
 longitude: number;
}