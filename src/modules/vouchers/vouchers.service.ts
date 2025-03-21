import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

/**
 * Service responsible for managing vouchers.
 * Provides methods to create, retrieve, update, and delete vouchers.
 */
@Injectable()
export class VouchersService {
  /**
   * Constructs an instance of the VouchersService.
   * @param prisma - The PrismaService instance used for database interactions.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new voucher.
   * @param createVoucherDto - The DTO containing voucher details.
   * @returns The created voucher.
   */
  async create(createVoucherDto: CreateVoucherDto) {
    try {
      const existingVoucher = await this.prisma.voucher.findUnique({
        where: { code: createVoucherDto.code },
      });

      if (existingVoucher) {
        throw new ConflictException('A voucher with this code already exists.');
      }

      return await this.prisma.voucher.create({
        data: {
          ...createVoucherDto,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves all vouchers with pagination.
   * @param page - The page number for pagination.
   * @returns A list of vouchers.
   */
  async findAll(page: number) {
    try {
      const pageSize = 25;
      return await this.prisma.voucher.findMany({
        take: page === 0 ? undefined : pageSize,
        skip: page > 0 ? (page - 1) * pageSize : 0,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a single voucher by its ID.
   * @param id - The ID of the voucher to retrieve.
   * @returns The voucher with the specified ID.
   */
  async findOne(id: string) {
    try {
      const voucher = await this.prisma.voucher.findUnique({ where: { id } });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      return voucher;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Updates a voucher by its ID.
   * @param id - The ID of the voucher to update.
   * @param updateVoucherDto - The DTO containing updated voucher details.
   * @returns The updated voucher.
   */
  async update(id: string, updateVoucherDto: UpdateVoucherDto) {
    try {
      const voucher = await this.prisma.voucher.findUnique({ where: { id } });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      await this.prisma.voucher.update({
        where: { id },
        data: updateVoucherDto,
      });

      return { message: 'Voucher updated successfully.', status: 200 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes a voucher by its ID.
   * @param id - The ID of the voucher to delete.
   * @returns A confirmation message.
   */
  async remove(id: string) {
    try {
      const voucher = await this.prisma.voucher.findUnique({ where: { id } });

      if (!voucher) {
        throw new NotFoundException('Voucher not found.');
      }

      await this.prisma.voucher.delete({ where: { id } });

      return { message: 'Voucher deleted successfully.', status: 204 };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
