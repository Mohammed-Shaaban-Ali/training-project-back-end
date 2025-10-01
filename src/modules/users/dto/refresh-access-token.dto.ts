import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";





export class RefreshAccessTokenDto {

  @IsNotEmpty()
  @ApiProperty({description: 'The refresh access token to generate new valid access token'})
  refreshToken: string;
}