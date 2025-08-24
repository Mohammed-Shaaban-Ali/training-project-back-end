import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SchoolType } from './entities/school-type.entity';
import { CreateSchoolTypeDto } from './dto/create-school-type.dto';
import { UpdateSchoolTypeDto } from './dto/update-school-type.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { PaginatedResult, PaginationHelper } from 'src/common';

@Injectable()
export class SchoolTypesService {
  constructor(
    @InjectRepository(SchoolType)
    private readonly schoolTypeRepository: Repository<SchoolType>,
  ) {}

  async create(createSchoolTypeDto: CreateSchoolTypeDto): Promise<SchoolType> {
    try {
      // Check if school type with same name already exists
      const existingSchoolType = await this.schoolTypeRepository.findOne({
        where: { name: createSchoolTypeDto.name },
      });

      if (existingSchoolType) {
        throw new ConflictException(
          'School type with this name already exists',
        );
      }

      const schoolType = this.schoolTypeRepository.create(createSchoolTypeDto);
      return await this.schoolTypeRepository.save(schoolType);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create school type');
    }
  }

  async findAll(
    query: FilterAndPaginationDto,
  ): Promise<PaginatedResult<SchoolType>> {
    const queryBuilder = this.createFilteredQuery(query);

    const total = await queryBuilder.getCount();

    // Apply pagination
    if (query.page && query.limit) {
      queryBuilder.skip(query.skip).take(query.limit);
    }

    const schoolTypes = await queryBuilder.getMany();

    const page = query.page || 1;
    const limit = query.limit || total || 10;

    return PaginationHelper.paginate(schoolTypes, total, page, limit);
  }

  async findOne(id: number): Promise<SchoolType> {
    const schoolType = await this.schoolTypeRepository.findOne({
      where: { id },
      relations: ['educationTypes'],
    });

    if (!schoolType) {
      throw new NotFoundException(`School type with ID ${id} not found`);
    }

    return schoolType;
  }

  async update(
    id: number,
    updateSchoolTypeDto: UpdateSchoolTypeDto,
  ): Promise<SchoolType> {
    const schoolType = await this.findOne(id);

    // Check for unique constraint if name is being updated
    if (
      updateSchoolTypeDto.name &&
      updateSchoolTypeDto.name !== schoolType.name
    ) {
      const existingSchoolType = await this.schoolTypeRepository.findOne({
        where: { name: updateSchoolTypeDto.name },
      });

      if (existingSchoolType) {
        throw new ConflictException(
          'School type with this name already exists',
        );
      }
    }

    try {
      Object.assign(schoolType, updateSchoolTypeDto);
      return await this.schoolTypeRepository.save(schoolType);
    } catch (error) {
      throw new BadRequestException('Failed to update school type');
    }
  }

  async remove(id: number): Promise<void> {
    const schoolType = await this.findOne(id);

    await this.schoolTypeRepository.remove(schoolType);
  }

  private createFilteredQuery(
    query: FilterAndPaginationDto,
  ): SelectQueryBuilder<SchoolType> {
    const { page, limit, ...filters } = query;
    const queryBuilder = this.schoolTypeRepository
      .createQueryBuilder('schoolType')
      .orderBy('schoolType.created_at', 'DESC');

    if (filters.search) {
      queryBuilder.andWhere('schoolType.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    return queryBuilder;
  }
}