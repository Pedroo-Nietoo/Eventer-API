import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/role.enum';

export class UserResponseDto {
 @ApiProperty({ example: '3869a378-d6d3-43af-afdf-19df31e5392d' })
 id: string;

 @ApiProperty({ example: 'johndoe' })
 username: string;

 @ApiProperty({ example: 'john@example.com' })
 email: string;

 @ApiProperty({ example: 'https://avatar.com/user.png', nullable: true })
 profilePicture: string;

 @ApiProperty({ enum: UserRole })
 role: UserRole;

 @ApiProperty()
 createdAt: Date;

 @ApiProperty()
 updatedAt: Date;
}