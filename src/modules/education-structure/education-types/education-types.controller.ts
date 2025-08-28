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
import { EducationTypesService } from './education-types.service';
import { CreateEducationTypeDto } from './dto/create-education-type.dto';
import { UpdateEducationTypeDto } from './dto/update-education-type.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { EducationType } from './entities/education-type.entity';
import { PaginatedResult } from 'src/common';

@Controller('education-types')
export class EducationTypesController {
  constructor(private readonly educationTypesService: EducationTypesService) {}

  @Post()
  async create(
    @Body() createEducationTypeDto: CreateEducationTypeDto,
  ): Promise<EducationType> {
    return await this.educationTypesService.create(createEducationTypeDto);
  }

  @Get()
  async findAll(
    @Query() query: FilterAndPaginationDto,
  ): Promise<PaginatedResult<EducationType>> {
    return await this.educationTypesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<EducationType> {
    return await this.educationTypesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEducationTypeDto: UpdateEducationTypeDto,
  ): Promise<EducationType> {
    return await this.educationTypesService.update(id, updateEducationTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.educationTypesService.remove(id);
  }
}
