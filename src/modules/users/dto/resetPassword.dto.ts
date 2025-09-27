import { IsNotEmpty, IsString } from "class-validator";
import { IsStrongPassword } from "./change-password.dto";



export class ResetTokenDto {


  @IsNotEmpty()
  @IsString()
  resetToken: string;

  @IsNotEmpty()
  @IsString()
  // @IsStrongPassword()
  newPassword: string;
}