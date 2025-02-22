import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  ticketCount: number;

  @IsOptional()
  @IsBoolean()
  customTickets: boolean;

  @IsOptional()
  @IsNumber()
  ticketDefaultPrice: number;

  @IsOptional()
  @IsUUID()
  categoryId: string;
}
