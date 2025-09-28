import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";


export class ForgetPasswordDto {
  
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}