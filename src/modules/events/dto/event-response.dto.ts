import { ApiProperty } from '@nestjs/swagger';

export class EventResponseDto {
 @ApiProperty({ example: 'uuid-v4-id' })
 id: string;

 @ApiProperty({ example: 'uuid-v4-id' })
 organizerId: string;

 @ApiProperty({ example: 'show-da-virada-cuid2' })
 slug?: string;

 @ApiProperty({ example: 'Show da Virada 2026' })
 title: string;

 @ApiProperty({ example: 'Descrição completa...' })
 description: string;

 @ApiProperty({ example: 'https://url.com/img.jpg' })
 coverImageUrl: string;

 @ApiProperty({ example: '2026-12-31T21:00:00Z' })
 eventDate: Date;

 @ApiProperty({
  example: { latitude: -23.55, longitude: -46.63, distance: 1.5 }
 })
 location?: {
  latitude: number;
  longitude: number;
  distance?: number;
 };

 @ApiProperty()
 createdAt?: Date;
}