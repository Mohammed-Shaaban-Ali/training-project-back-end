import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolTypesService } from './school-types.service';
import { SchoolTypesController } from './school-types.controller';
import { SchoolType } from './entities/school-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolType])],
  controllers: [SchoolTypesController],
  providers: [SchoolTypesService],
  exports: [SchoolTypesService],
})
export class SchoolTypesModule {}
