import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Put,
  Logger,
} from '@nestjs/common';

import { 
  ChangePasswordDto, 
  CreateUserDto, 
  FilterAndPaginationDto, 
  ResetTokenDto, 
  UpdateUserDto } from './dto';

import { User } from './entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UsersInterface } from './users.interface';
import { CurrentUser } from 'src/common/decorators/currentUser';
import { Hostname } from 'src/common/decorators';
import { Public } from 'src/common/decorators/publicRoute';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name, {timestamp: true});

  constructor(
    private readonly userInterface: UsersInterface,
  ) {}

  @Public() // skip auth for this route 
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {

    const result = await this.userInterface.create(createUserDto);
    return result;
  }

  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(AttachUserInterceptor)
  @Get()
  async findAll( @Query() query: FilterAndPaginationDto): Promise<PaginatedResult<User>>  {

    const result =  await this.userInterface.findAll(query);
    console.log('----result from controller---');
    console.log(result);

    return result;
  }

  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(AttachUserInterceptor)
  @Get('me')
  getCurrentLoggedUser(@CurrentUser() currentUser: User) {
    return { currentUser};
  }


  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(AttachUserInterceptor)
  @Public()
  @Post('forgetPassword')
  async forgetPassword(@Body() requestBody: {email: string}, @Hostname() hostname: string) {

    await this.userInterface.forgetPassword({...requestBody, hostname});

    return {message: "We've sent a password reset link to your email address. The link will expire in 15 minutes for security purposes."};

  }



  @Public()
  @Put('resetPassword')
  async resetPassword (@Body() requestBody: ResetTokenDto) {

    console.log('---requestBody:', requestBody);
    await this.userInterface.resetPassword({...requestBody});
    return {message: 'Password successfully reset.'};
  }

  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(AttachUserInterceptor)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() loggerUser: User): Promise<User> {

    if (loggerUser && id === loggerUser.id) {
      return loggerUser;  
    } else {
      const user =  await this.userInterface.findOne(id);
      return user;
    }
  }

  // @UseGuards(AuthenticationGuard)
  @Put(':id')
  async update( 
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {


    const user = await this.userInterface.update({id, updateUserDto });
    return user;
  }

  // @UseGuards(AuthenticationGuard)
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<User> {

    const user = await this.userInterface.toggleActive(id);
    return user;
  }

  // @UseGuards(AuthenticationGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {

    await this.userInterface.remove(id);

  }

  // @UseGuards(AuthenticationGuard)
  // @UseInterceptors(AttachUserInterceptor)
  @Patch('changePassword') 
  async changePassword (
    @Body() body: ChangePasswordDto , 
    @CurrentUser() currentUser: User,
  ) {


    await this.userInterface.changePassword({id: currentUser.id, body});

    return {message: 'Password successfully changed'};

  }




}
