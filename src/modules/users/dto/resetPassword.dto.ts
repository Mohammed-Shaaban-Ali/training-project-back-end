import { IsNotEmpty, IsString } from "class-validator";
import { IsStrongPassword } from "./change-password.dto";
import { ApiProperty } from "@nestjs/swagger";



export class ResetTokenDto {


  @IsNotEmpty()
  @IsString()
  @ApiProperty({description: 'The reset password token, send via email link url'})
  resetToken: string;

  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword()
  @ApiProperty({description: 'The new password'})
  newPassword: string;
}