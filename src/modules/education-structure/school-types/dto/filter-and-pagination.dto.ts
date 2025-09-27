import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common';

export class FilterAndPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}
