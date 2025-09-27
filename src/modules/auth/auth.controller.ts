import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users';
import { LoginDto } from '../users/dto/login-user.dto';
import { Public } from 'src/common/decorators/publicRoute';

@Controller('auth')
export class AuthController {



  constructor(private readonly authService: AuthService) {}

  @Public() // skip auth for this route 
  @Post('singup') 
  async singUp (@Body() body: CreateUserDto) {

    const result = await this.authService.signUp(body);

    
    return {...result};

  }

  @Public() // skip auth for this route 
  @Post('login') 
  async login(@Body() {email, password}: LoginDto) {

    const result = await this.authService.login({email, password});
    return {...result};

  }


}
