import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Matches } from 'class-validator';
import { AcademicTrack, EducationLevel } from 'src/enums/shared.enums';

const trim = (value: any) => (typeof value === 'string' ? value.trim() : value);
const NIN_REGEX = /^\d{14}$/;

export class ProfileSettingsDto {
  @IsOptional()
  @IsString()
  @Transform(({value}) =>trim(value))
  educationType?: string;

  @IsOptional()
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel;

  @IsOptional()
  @IsNumber()
  academicYear?: number;

  @IsOptional()
  @IsEnum(AcademicTrack)
  academicTrack?: AcademicTrack;

  @IsOptional()
  @IsEnum([1, 2])
  semester?: 1 | 2;

  @IsOptional()
  @IsString()
  @Transform(({value}) => trim(value))
  secondForeignLanguage?: string;

  @IsOptional()
  @IsString()
  @Transform(({value}) => trim(value))
  schoolType?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => trim(value))
  governorate: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({value}) => trim(value))
  district: string;

  @IsOptional()
  @IsString()
  @Matches(NIN_REGEX, { message: 'NIN must be 14 digits' })
  @Transform(({ value }) => trim(value))
  NIN?: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG', { message: 'parentPhoneNo must be a valid EG mobile' })
  @IsString()
  @Transform(({ value }) => trim(value))
  parentPhoneNo: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG', { message: 'phoneNo must be a valid EG mobile' })

  @IsString()
  @Transform(({ value }) => trim(value))
  phoneNo: string;
}
