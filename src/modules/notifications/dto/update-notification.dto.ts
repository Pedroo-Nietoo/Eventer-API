import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';

/**
 * Data Transfer Object (DTO) for updating a notification.
 *
 * This class extends a partial type of CreateNotificationDto.
 * It allows for partial updates to a notification's information.
 *
 * @extends PartialType
 * @see CreateNotificationDto
 */
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
