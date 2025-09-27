import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSchoolTypeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;
}
