import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { IsStrongPassword } from './change-password.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  @ApiProperty()
  email: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  teacher_id?: number;

  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword() //! will be disabled for now for easy testing
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  @ApiProperty()
  role: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional()
  image?: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  active?: boolean;
}
