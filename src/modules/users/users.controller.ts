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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UsersInterface } from './users.interface';
import { AuthenticationGuard } from 'src/common/guards/authentiation.guard';
import { AttachUserInterceptor } from 'src/modules/users/interceptors/attachUser.interceptor';
import { CurrentUser } from 'src/common/decorators/currentUser';
import { ChangePasswordDto, CreateUserDto, FilterAndPaginationDto, UpdateUserDto } from './dto';
import { Hostname } from 'src/common/decorators';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name, {timestamp: true});

  constructor(
    private readonly userInterface: UsersInterface,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {

    const result = await this.userInterface.create(createUserDto);
    return result;
  }

  @Get()
  async findAll( @Query() query: FilterAndPaginationDto): Promise<PaginatedResult<User>>  {

    const result =  await this.userInterface.findAll(query);
    return result;
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AttachUserInterceptor)
  @Get('me')
  getCurrentLoggedUser(@CurrentUser() currentUser: User) {
    return { currentUser};
  }


  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AttachUserInterceptor)
  @Post('forgetPassword')
  async forgetPassword(@CurrentUser() currentUser: User, @Hostname() hostname) {

    await this.userInterface.forgetPassword({currentUser, hostname});

    return {message: "We've sent a password reset link to your email address. The link will expire in 15 minutes for security purposes."};

  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AttachUserInterceptor)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() loggerUser: User): Promise<User> {

    if (loggerUser && id === loggerUser.id) {
      return loggerUser;  
    } else {
      const user =  await this.userInterface.findOne(id);
      return user;
    }
  }

  @UseGuards(AuthenticationGuard)
  @Put(':id')
  async update( 
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {


    const user = await this.userInterface.update({id, updateUserDto });
    return user;
  }

  @UseGuards(AuthenticationGuard)
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<User> {

    const user = await this.userInterface.toggleActive(id);
    return user;
  }

  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {

    await this.userInterface.remove(id);

  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AttachUserInterceptor)
  @Patch('changePassword') 
  async changePassword (
    @Body() body: ChangePasswordDto , 
    @CurrentUser() currentUser: User,
    // @Hostname() hostname: string,

  ) {


    await this.userInterface.changePassword({id: currentUser.id, body});

    return {message: 'Password successfully changed'};

  }




}
