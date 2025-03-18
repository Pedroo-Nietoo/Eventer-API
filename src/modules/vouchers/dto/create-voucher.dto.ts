import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Data Transfer Object (DTO) for creating a voucher.
 */
export class CreateVoucherDto {
  /**
   * Unique code for the voucher.
   * @type {string}
   */
  @IsNotEmpty()
  @IsString()
  code: string;

  /**
   * Discount percentage or amount.
   * @type {number}
   */
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  /**
   * The start date of the voucher's validity.
   * @type {Date}
   */
  @IsNotEmpty()
  @IsDate()
  validFrom: Date;

  /**
   * The end date of the voucher's validity.
   * @type {Date}
   */
  @IsNotEmpty()
  @IsDate()
  validTo: Date;
}
