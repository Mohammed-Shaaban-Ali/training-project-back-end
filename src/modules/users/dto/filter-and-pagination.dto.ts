import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../entities/user.entity';
import { PaginationDto } from 'src/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAndPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  search?: string; // search with name or email

  @IsOptional()
  @IsEnum(UserRole)
  @ApiPropertyOptional()
  role?: UserRole;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @ApiPropertyOptional()
  active?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional()
  teacher_id?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  phone?: string;
}
