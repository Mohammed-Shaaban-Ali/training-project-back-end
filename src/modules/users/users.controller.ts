import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dtos/createNewUser.dto";





@Controller('users')
export class UserController {
  @Post('/create') 
  createNewUser(@Body() newUser: CreateUserDto) {
    try {

    } catch(error) {

    }
  }
}