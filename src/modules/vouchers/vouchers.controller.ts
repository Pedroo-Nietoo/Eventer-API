import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  /**
   * Creates a new voucher.
   * @param createVoucherDto - The DTO containing voucher details.
   * @returns The created voucher.
   */
  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  /**
   * Retrieves all vouchers with pagination.
   * @param page - The page number for pagination (default is 1).
   * @returns A list of vouchers.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.vouchersService.findAll(page);
  }

  /**
   * Retrieves a single voucher by its ID.
   * @param id - The ID of the voucher to retrieve.
   * @returns The voucher with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  /**
   * Updates a voucher by its ID.
   * @param id - The ID of the voucher to update.
   * @param updateVoucherDto - The DTO containing updated voucher details.
   * @returns The updated voucher.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  /**
   * Deletes a voucher by its ID.
   * @param id - The ID of the voucher to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
}
