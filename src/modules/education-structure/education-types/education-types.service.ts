import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EducationType } from './entities/education-type.entity';
import { SchoolType } from '../school-types/entities/school-type.entity';
import { CreateEducationTypeDto } from './dto/create-education-type.dto';
import { UpdateEducationTypeDto } from './dto/update-education-type.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { PaginatedResult, PaginationHelper } from 'src/common';

@Injectable()
export class EducationTypesService {
  constructor(
    @InjectRepository(EducationType)
    private readonly educationTypeRepository: Repository<EducationType>,
    @InjectRepository(SchoolType)
    private readonly schoolTypeRepository: Repository<SchoolType>,
  ) {}

  async create(
    createEducationTypeDto: CreateEducationTypeDto,
  ): Promise<EducationType> {
    try {
      // Verify that the school type exists
      const schoolType = await this.schoolTypeRepository.findOne({
        where: { id: createEducationTypeDto.schoolTypeId },
      });

      if (!schoolType) {
        throw new NotFoundException(
          `School type with ID ${createEducationTypeDto.schoolTypeId} not found`,
        );
      }

      // Check if education type with same name and school type already exists
      const existingEducationType = await this.educationTypeRepository.findOne({
        where: {
          name: createEducationTypeDto.name,
          schoolType: { id: createEducationTypeDto.schoolTypeId },
        },
        relations: ['schoolType'],
      });

      if (existingEducationType) {
        throw new ConflictException(
          'Education type with this name already exists for this school type',
        );
      }

      // Create education type with school type relation
      const educationType = this.educationTypeRepository.create({
        ...createEducationTypeDto,
        schoolType: schoolType,
      });

      return await this.educationTypeRepository.save(educationType);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create education type');
    }
  }

  async findAll(
    query: FilterAndPaginationDto,
  ): Promise<PaginatedResult<EducationType>> {
    const queryBuilder = this.createFilteredQuery(query);

    const total = await queryBuilder.getCount();

    // Apply pagination
    if (query.page && query.limit) {
      queryBuilder.skip(query.skip).take(query.limit);
    }

    const educationTypes = await queryBuilder.getMany();

    const page = query.page || 1;
    const limit = query.limit || total || 10;

    return PaginationHelper.paginate({
      users: educationTypes, // Using 'users' as the key because that's what the helper expects
      total,
      page,
      limit
    });
  }

  async findOne(id: number): Promise<EducationType> {
    const educationType = await this.educationTypeRepository.findOne({
      where: { id },
      relations: ['schoolType'],
    });

    if (!educationType) {
      throw new NotFoundException(`Education type with ID ${id} not found`);
    }

    return educationType;
  }

  async update(
    id: number,
    updateEducationTypeDto: UpdateEducationTypeDto,
  ): Promise<EducationType> {
    const educationType = await this.findOne(id);

    // If schoolTypeId is being updated, verify the new school type exists
    if (updateEducationTypeDto.schoolTypeId) {
      const schoolType = await this.schoolTypeRepository.findOne({
        where: { id: updateEducationTypeDto.schoolTypeId },
      });

      if (!schoolType) {
        throw new NotFoundException(
          `School type with ID ${updateEducationTypeDto.schoolTypeId} not found`,
        );
      }

      // Check for unique constraint with the new school type
      if (
        updateEducationTypeDto.name ||
        updateEducationTypeDto.schoolTypeId !== educationType.schoolType.id
      ) {
        const nameToCheck = updateEducationTypeDto.name || educationType.name;
        const schoolTypeIdToCheck = updateEducationTypeDto.schoolTypeId;

        const existingEducationType =
          await this.educationTypeRepository.findOne({
            where: {
              name: nameToCheck,
              schoolType: { id: schoolTypeIdToCheck },
            },
            relations: ['schoolType'],
          });

        if (existingEducationType && existingEducationType.id !== id) {
          throw new ConflictException(
            'Education type with this name already exists for this school type',
          );
        }
      }

      // Update the school type relation
      educationType.schoolType = schoolType;
    } else if (
      updateEducationTypeDto.name &&
      updateEducationTypeDto.name !== educationType.name
    ) {
      // Check for unique constraint with current school type if only name is being updated
      const existingEducationType = await this.educationTypeRepository.findOne({
        where: {
          name: updateEducationTypeDto.name,
          schoolType: { id: educationType.schoolType.id },
        },
        relations: ['schoolType'],
      });

      if (existingEducationType && existingEducationType.id !== id) {
        throw new ConflictException(
          'Education type with this name already exists for this school type',
        );
      }
    }

    try {
      // Update other properties
      if (updateEducationTypeDto.name) {
        educationType.name = updateEducationTypeDto.name;
      }

      return await this.educationTypeRepository.save(educationType);
    } catch (error) {
      throw new BadRequestException('Failed to update education type');
    }
  }

  async remove(id: number): Promise<void> {
    const educationType = await this.findOne(id);
    await this.educationTypeRepository.remove(educationType);
  }

  async findBySchoolType(schoolTypeId: number): Promise<EducationType[]> {
    const schoolType = await this.schoolTypeRepository.findOne({
      where: { id: schoolTypeId },
    });

    if (!schoolType) {
      throw new NotFoundException(
        `School type with ID ${schoolTypeId} not found`,
      );
    }

    return await this.educationTypeRepository.find({
      where: { schoolType: { id: schoolTypeId } },
      relations: ['schoolType'],
      order: { created_at: 'DESC' },
    });
  }

  private createFilteredQuery(
    query: FilterAndPaginationDto,
  ): SelectQueryBuilder<EducationType> {
    const { page, limit, schoolTypeId, ...filters } = query;
    const queryBuilder = this.educationTypeRepository
      .createQueryBuilder('educationType')
      .leftJoinAndSelect('educationType.schoolType', 'schoolType')
      .orderBy('educationType.created_at', 'DESC');

    if (filters.search) {
      queryBuilder.andWhere(
        '(educationType.name ILIKE :search OR schoolType.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (schoolTypeId) {
      queryBuilder.andWhere('educationType.schoolType.id = :schoolTypeId', {
        schoolTypeId,
      });
    }

    return queryBuilder;
  }
}
