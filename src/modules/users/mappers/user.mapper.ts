import { User } from '@users/entities/user.entity';
import { UserResponseDto } from '@users/dto/user-response.dto';

export class UserMapper {

 static toResponse(user: User): UserResponseDto {
  return {
   id: user.id,
   username: user.username,
   email: user.email,
   profilePicture: user.profilePicture,
   role: user.role,
   createdAt: user.createdAt,
   updatedAt: user.updatedAt,
  };
 }

 static toResponseList(users: User[]): UserResponseDto[] {
  return users.map((user) => this.toResponse(user));
 }

}