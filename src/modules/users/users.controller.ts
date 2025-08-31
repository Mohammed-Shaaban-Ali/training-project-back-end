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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterAndPaginationDto } from './dto/filter-and-pagination.dto';
import { User } from './entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { UsersInterface } from './users.interface';
import { ok } from 'src/common/helpers/ok-reponse.helper';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { fail } from 'src/common/helpers/fail-response.helper';

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
  async findAll( @Query() query: FilterAndPaginationDto,): Promise<PaginatedResult<User>>  {

    const result =  await this.userInterface.findAll(query);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {

    const user =  await this.userInterface.findOne(id);
    return user;
  }

  @Put(':id')
  async update( @Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto ): Promise<User> {

    const user = await this.userInterface.update({id, updateUserDto });
    return user;
  }


  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number): Promise<User> {

    const user = await this.userInterface.toggleActive(id);
    return user;
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {

    await this.userInterface.remove(id);

  }
}
