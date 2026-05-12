import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({ example: 'uuid-v4-id' })
  id!: string;

  @ApiProperty({ example: 'uuid-v4-id' })
  organizerId!: string;

  @ApiPropertyOptional({ example: 'show-da-virada-cuid2' })
  slug?: string;

  @ApiProperty({ example: 'Show da Virada 2026' })
  title!: string;

  @ApiPropertyOptional({ example: 'Descrição completa...' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://url.com/img.jpg' })
  coverImageUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Se true, o evento é restrito por idade',
  })
  isAgeRestricted!: boolean;

  @ApiProperty({ example: '2026-12-31T21:00:00Z' })
  eventDate!: Date;

  @ApiProperty({
    example: { latitude: -23.55, longitude: -46.63, distance: 1.5 },
  })
  location?: {
    latitude: number;
    longitude: number;
    distance?: number;
  };

  @ApiProperty()
  createdAt!: Date;
}
