import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Data Transfer Object for creating an event.
 */
export class CreateEventDto {
  /**
   * The name of the event.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * The slug of the event.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  slug: string;

  /**
   * The description of the event.
   * @type {string}
   * @optional
   */
  @IsOptional()
  @IsString()
  description: string;

  /**
   * The address of the event.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  address: string;

  /**
   * The latitude coordinate of the event location.
   * @type {number}
   */
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  /**
   * The longitude coordinate of the event location.
   * @type {number}
   */
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  /**
   * The date of the event.
   * @type {Date}
   */
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  /**
   * The contact phone number for the event.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  phone: string;

  /**
   * The number of tickets available for the event.
   * @type {number}
   */
  @IsNotEmpty()
  ticketCount: number;

  /**
   * Indicates if custom tickets are allowed for the event.
   * @type {boolean}
   * @optional
   */
  @IsOptional()
  @IsBoolean()
  customTickets: boolean;

  /**
   * The default price for tickets if custom tickets are not used.
   * @type {number}
   * @optional
   */
  @IsOptional()
  @IsNumber()
  ticketDefaultPrice: number;

  /**
   * The ID of the user to which the event belongs.
   * @type {string}
   * @optional
   */
  @IsUUID()
  userOwnerId: string;

  /**
   * The ID of the category to which the event belongs.
   * @type {string}
   * @optional
   */
  @IsOptional()
  @IsUUID()
  categoryId: string;
}
