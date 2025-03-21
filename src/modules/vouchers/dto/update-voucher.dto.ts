import { PartialType } from '@nestjs/mapped-types';
import { CreateVoucherDto } from './create-voucher.dto';

/**
 * Data Transfer Object (DTO) for updating a voucher.
 *
 * This class extends a partial type of CreateVoucherDto, allowing for partial updates
 * to a voucher's information. It inherits all properties from CreateVoucherDto
 * but makes them optional.
 *
 * @extends PartialType
 * @see CreateVoucherDto
 */
export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {}