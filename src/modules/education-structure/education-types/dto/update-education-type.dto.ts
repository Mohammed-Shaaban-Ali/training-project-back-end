import { PartialType } from '@nestjs/mapped-types';
import { CreateEducationTypeDto } from './create-education-type.dto';

export class UpdateEducationTypeDto extends PartialType(CreateEducationTypeDto) {}
