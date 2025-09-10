import {IsEmail, IsNotEmpty, Min} from 'class-validator';

export class LoginDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;


  // @Min(6)
  @IsNotEmpty()
  password: string;
}