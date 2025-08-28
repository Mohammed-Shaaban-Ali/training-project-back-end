import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEducationTypeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  schoolTypeId: number;
}
