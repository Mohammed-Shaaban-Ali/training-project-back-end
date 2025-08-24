import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SchoolTypesService } from './school-types.service';
import { CreateSchoolTypeDto } from './dto/create-school-type.dto';
import { UpdateSchoolTypeDto } from './dto/update-school-type.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { SchoolType } from './entities/school-type.entity';
import { PaginatedResult } from 'src/common';

@Controller('school-types')
export class SchoolTypesController {
  constructor(private readonly schoolTypesService: SchoolTypesService) {}

  @Post()
  async create(
    @Body() createSchoolTypeDto: CreateSchoolTypeDto,
  ): Promise<SchoolType> {
    return await this.schoolTypesService.create(createSchoolTypeDto);
  }

  @Get()
  async findAll(
    @Query() query: FilterAndPaginationDto,
  ): Promise<PaginatedResult<SchoolType>> {
    return await this.schoolTypesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SchoolType> {
    return await this.schoolTypesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolTypeDto: UpdateSchoolTypeDto,
  ): Promise<SchoolType> {
    return await this.schoolTypesService.update(id, updateSchoolTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.schoolTypesService.remove(id);
  }
}
