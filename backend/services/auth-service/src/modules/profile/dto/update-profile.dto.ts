import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  fullname: string;

  @ApiPropertyOptional({ example: 'new.email@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email is invalid' })
  newEmail: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: 'Password@123', description: 'Required to save changes' })
  @IsNotEmpty({ message: 'Current password is required to save changes' })
  currentPassword: string;
}