import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, Min} from 'class-validator';

export class LoginDto {

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({example: 'mahqwerty31@gmail.com'})
  email: string;


  // @Min(6)
  @IsNotEmpty()
  @ApiProperty({example: 'faragfarag'})
  password: string;
}