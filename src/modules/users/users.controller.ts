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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@decorators/public.decorator';

/**
 * UsersController handles all user-related HTTP requests.
 */
@Controller('users')
export class UsersController {
  /**
   * Creates an instance of UsersController.
   * @param usersService - The service used to manage users.
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user.
   * @param createUserDto - Data Transfer Object containing user creation data.
   * @returns The created user.
   */
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Retrieves a paginated list of users.
   * @param page - The page number to retrieve, defaults to 1.
   * @returns A list of users.
   */
  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.usersService.findAll(page);
  }

  /**
   * Retrieves a single user by ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Updates a user by ID.
   * @param id - The ID of the user to update.
   * @param updateUserDto - Data Transfer Object containing user update data.
   * @returns The updated user.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user by ID.
   * @param id - The ID of the user to delete.
   * @returns A confirmation message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
