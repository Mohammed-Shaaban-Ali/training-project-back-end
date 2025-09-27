import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationTypesService } from './education-types.service';
import { EducationTypesController } from './education-types.controller';
import { EducationType } from './entities/education-type.entity';
import { SchoolType } from '../school-types/entities/school-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolType, EducationType])],
  controllers: [EducationTypesController],
  providers: [EducationTypesService],
  exports: [EducationTypesService],
})
export class EducationTypesModule {}
