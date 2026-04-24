import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/constants/user-roles.js';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the agent or admin' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@realityflow.com', description: 'Email address (must be unique)' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.AGENT, description: 'Role of the user in the system' })
  @IsEnum(UserRole)
  role: UserRole;
}
